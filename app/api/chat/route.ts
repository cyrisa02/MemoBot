import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getEmbedding } from "@/lib/huggingface";
import { generateAnswer } from "../../../lib/groq"; 

// On utilise la clé anon ici car les requêtes sont faites au nom de l'utilisateur
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { question,  history  } = await req.json();

    if (!question) return NextResponse.json({ error: "Question vide" }, { status: 400 });

    // 1. Transformer la question en vecteur
    const queryEmbedding = await getEmbedding(question, "query");

    // 2. Chercher les passages pertinents dans Supabase (VRAIE RECHERCHE VECTORIELLE)
    const { data: sections, error } = await supabase.rpc("match_document_sections", {
      query_embedding: queryEmbedding,
      match_threshold: 0.1, // Seuil abaissé pour être sûr que ça passe
      match_count: 2,
    });

    if (error) {
      console.error("Erreur Supabase RPC:", error);
      throw error;
    }

    // 3. Si aucun document ne correspond, on renvoie un message de repli
    if (!sections || sections.length === 0) {
      return NextResponse.json({ 
        answer: "Je n'ai pas trouvé cette information dans les documents de l'entreprise.",
        sources: []
      });
    }

    // 4. Construire le contexte à partir des morceaux trouvés
    const context = sections.map((s: any) => s.content).join("\n\n---\n\n");

    // 5. Générer la réponse avec Groq
    const answer = await generateAnswer(question, context, history || []);

    // 6. Récupérer les noms des documents sources
    const documentIds = [...new Set(sections.map((s: any) => s.document_id))];
    const { data: docs } = await supabase
      .from("documents")
      .select("name")
      .in("id", documentIds);

    return NextResponse.json({ 
      answer, 
      sources: docs?.map(d => d.name) || [] 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
