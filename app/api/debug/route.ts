import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // On utilise la clé admin pour lire
);

export async function GET() {
  try {
    // On récupère le texte, mais PAS l'embedding (qui est trop lourd à afficher)
    const { data: sections, error } = await supabase
      .from("document_sections")
      .select("id, content")
      .limit(5);

    if (error) throw error;

    return NextResponse.json({
      totalChunks: sections.length,
      texteExtrait: sections.map(s => s.content)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
