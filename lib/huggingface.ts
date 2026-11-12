import { pipeline, env } from "@huggingface/transformers";

// Configuration CRUCIALE pour Vercel (Serverless)
env.allowLocalModels = false; // Empêche le chargement de fichiers .node natifs
// @ts-ignore
if (env.backends.onnx.wasm) {
  // Limite à 1 thread pour éviter les problèmes de mémoire en serverless
  env.backends.onnx.wasm.numThreads = 1;
}

let extractor: any = null;

export async function getEmbedding(text: string, type: "query" | "passage" = "passage"): Promise<number[]> {
  try {
    if (!extractor) {
      extractor = await pipeline("feature-extraction", "Xenova/multilingual-e5-small", {
        dtype: "q8",
        device: 'cpu', // 'cpu' + allowLocalModels=false = WASM sur Vercel
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
