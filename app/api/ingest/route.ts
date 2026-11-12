import { NextResponse } from "next/server";
import { parse } from "@iyulab/unpdf";
import { createClient } from "@supabase/supabase-js";
import { getEmbedding } from "@/lib/huggingface";

// Autorise Vercel à laisser tourner la fonction jusqu'à 60s (max sur Hobby)
export const maxDuration = 60;

// Client Admin Supabase (côté serveur uniquement)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fonction pour découper le texte en morceaux
function chunkText(text: string, maxLength: number = 1000): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxLength) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += "\n" + paragraph;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });

    // 1. Extraire le texte du PDF en Markdown
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Utilisation de la nouvelle librairie pour obtenir du Markdown
    const pdfDoc = parse(new Uint8Array(buffer));
    const markdownText = pdfDoc.toMarkdown(); 

    if (!markdownText || markdownText.trim().length === 0) {
      return NextResponse.json({ error: "Le PDF ne contient pas de texte extractible." }, { status: 400 });
    }

    // 2. Insérer le document dans Supabase
    const { data: docData, error: docError } = await supabaseAdmin
      .from("documents")
      .insert({ name: file.name })
      .select()
      .single();

    if (docError) throw docError;

    // 3. Découper le texte Markdown
    // On peut garder 1000 caractères, le Markdown étant plus structuré
    const chunks = chunkText(markdownText, 1000);

    // 4. Générer les embeddings et insérer les chunks
    // On fait une boucle séquentielle (for) plutôt que Promise.all 
    // pour éviter de saturer l'API Jina et de dépasser son rate limit
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk, "passage");
      
      const { error: insertError } = await supabaseAdmin
        .from("document_sections")
        .insert({
          document_id: docData.id,
          content: chunk,
          embedding: embedding,
        });

      if (insertError) {
        console.error("Erreur insertion chunk:", insertError);
        // On continue quand même pour ne pas tout bloquer
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${chunks.length} morceaux ajoutés avec succès.` 
    });

  } catch (error: any) {
    console.error("Erreur d'ingestion:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
