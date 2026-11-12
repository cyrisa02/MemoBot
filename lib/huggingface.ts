import { pipeline, env } from "@huggingface/transformers";

// Configuration CRUCIALE pour Vercel (Serverless)
env.useBrowserCache = false;
env.allowLocalModels = false;

// Force la priorité WASM AVANT toute initialisation du pipeline
// Cela empêche la librairie de chercher onnxruntime-node (binaires natifs)
// @ts-ignore
env.backends.setPriority(['wasm', 'cpu']);

let extractor: any = null;

export async function getEmbedding(text: string, type: "query" | "passage" = "passage"): Promise<number[]> {
  try {
    if (!extractor) {
      extractor = await pipeline("feature-extraction", "Xenova/multilingual-e5-small", {
        dtype: "q8",
        // @ts-ignore
        device: 'wasm',
      });
    }

    const formattedText = `${type}: ${text}`;
    const output = await extractor(formattedText, { pooling: "mean", normalize: true });
    
    return Array.from(output.data);
  } catch (error) {
    console.error("Erreur Embedding Local:", error);
    throw error;
  }
}
