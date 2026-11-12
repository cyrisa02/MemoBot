export async function getEmbedding(text: string, type: "query" | "passage" = "passage"): Promise<number[]> {
  const apiKey = process.env.JINA_API_KEY;

  if (!apiKey) {
    throw new Error("JINA_API_KEY est introuvable dans les variables d'environnement");
  }

  try {
    const response = await fetch("https://api.jina.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "jina-embeddings-v3",
        input: [`${type}: ${text}`],
        dimensions: 768 // On force 768 dimensions pour garder ta table Supabase actuelle
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur API Jina:", errorData);
      throw new Error(errorData.detail || "Erreur lors de l'appel à Jina AI");
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Erreur Embedding Jina:", error);
    throw error;
  }
}
