import { pipeline } from "@huggingface/transformers";

let extractor: any = null;

// On ajoute un paramètre "type" pour savoir si c'est une question ou un document
export async function getEmbedding(text: string, type: "query" | "passage" = "passage"): Promise<number[]> {
  try {
    if (!extractor) {
      extractor = await pipeline("feature-extraction", "Xenova/multilingual-e5-small", {
        dtype: "q8",
      });
    }

    // On ajoute le préfixe recommandé par le modèle
    const formattedText = `${type}: ${text}`;

    const output = await extractor(formattedText, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error("Erreur Embedding Local:", error);
    throw error;
  }
}
