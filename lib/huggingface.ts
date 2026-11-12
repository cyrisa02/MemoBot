import { pipeline, env } from "@huggingface/transformers";

// Configuration CRUCIALE pour Vercel
env.useBrowserCache = false;
env.allowLocalModels = false;
// Force l'utilisation du backend WASM (onnxruntime-web) au lieu du natif
// @ts-ignore
env.backends.onnx.wasm = true; 

let extractor: any = null;

export async function getEmbedding(text: string, type: "query" | "passage" = "passage"): Promise<number[]> {
  try {
    if (!extractor) {
      // On s'assure que le pipeline utilise bien le backend WASM
      extractor = await pipeline("feature-extraction", "Xenova/multilingual-e5-small", {
        dtype: "q8",
        // @ts-ignore
        device: 'wasm', // Force le device WASM
      });
    }
    // ... suite de ton code
