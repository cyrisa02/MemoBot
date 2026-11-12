import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// On utilise la clé Service Role pour contourner les RLS lors de la suppression (pour le prototype)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET : Récupérer la liste des documents
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE : Supprimer un document (et ses morceaux associés)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    // Le "on delete cascade" dans Supabase supprimera automatiquement les document_sections liés
    const { error } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
