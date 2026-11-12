import { pipeline, env } from "@huggingface/transformers";

// Configuration CRUCIALE pour Vercel (Serverless)
env.useBrowserCache = false;
env.allowLocalModels = false;
// On force l'utilisation du backend WASM
// @ts-ignore
env.backends.onnx.wasm = true; 

let extractor: any = null;

export async function getEmbedding(text: string, type: "query" | "passage" = "passage"): Promise<number[]> {
  try {
    if (!extractor) {
      extractor = await pipeline("feature-extraction", "Xenova/multilingual-e5-small", {
        dtype: "q8",
        // @ts-ignore
        device: 'wasm', // Force le device WASM
      });
    }

    // On ajoute le préfixe recommandé par le modèle
    const formattedText = `${type}: ${text}`;

    const output = await extractor(formattedText, { pooling: "mean", normalize: true });
    
    // On s'assure de renvoyer un tableau de nombres simple
    return Array.from(output.data);
  } catch (error) {
    console.error("Erreur Embedding Local:", error);
    throw error;
  }
}
