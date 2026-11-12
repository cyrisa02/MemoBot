import { NextResponse } from "next/server";
// @ts-expect-error - pdf-parse n'a pas de types pour cet import interne
import pdf from "pdf-parse/lib/pdf-parse.js";
import { createClient } from "@supabase/supabase-js";
import { getEmbedding } from "@/lib/huggingface";
import { extractText } from "unpdf";

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

    // 1. Extraire le texte du PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { text: pdfText } = await extractText(new Uint8Array(buffer), { mergePages: true });

    // 2. Insérer le document dans Supabase
    const { data: docData, error: docError } = await supabaseAdmin
      .from("documents")
      .insert({ name: file.name })
      .select()
      .single();

    if (docError) throw docError;

    // 3. Découper le texte
    const chunks = chunkText(pdfText, 500);

    // 4. Générer les embeddings et insérer les chunks (en parallèle)
    const insertPromises = chunks.map(async (chunk) => {
      const embedding = await getEmbedding(chunk, "passage");
      return supabaseAdmin.from("document_sections").insert({
        document_id: docData.id,
        content: chunk,
        embedding: embedding, // Vecteur de 384 dimensions
      });
    });

    await Promise.all(insertPromises);

    return NextResponse.json({ 
      success: true, 
      message: `${chunks.length} morceaux ajoutés avec succès.` 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
