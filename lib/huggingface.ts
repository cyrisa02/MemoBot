import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN);

export async function getEmbedding(text: string, type: "query" | "passage" = "passage"): Promise<number[]> {
  try {
    // On utilise un modèle d'embedding standard et gratuit via l'API
    const result = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: `${type}: ${text}`, // On garde les préfixes pour la qualité
    });

    // L'API peut renvoyer un tableau de tableaux ou un tableau simple
    if (Array.isArray(result[0])) {
      return result[0] as number[];
    }
    return result as number[];
  } catch (error) {
    console.error("Erreur API Hugging Face:", error);
    throw error;
  }
}
