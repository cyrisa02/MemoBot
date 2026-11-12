export async function generateAnswer(question: string, context: string, history: any[] = []) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) throw new Error("GROQ_API_KEY manquante");

  // On prépare les messages avec l'historique
  const messages = [
    {
      role: "system",
      content: `Tu es un assistant d'entreprise intelligent et serviable.
Tu dois répondre à la question de l'utilisateur en te basant sur le contexte fourni ci-dessous.
RÈGLES IMPORTANTES :
1. Fais des phrases complètes et détaillées. Ne réponds pas juste par un mot.
2. Si la question est vague (ex: "que fait-on avec ?"), utilise l'historique de la conversation pour comprendre de quoi on parle.
3. N'utilise JAMAIS de balises HTML (comme <br>, <b>, etc.).
4. Si tu dois faire une liste, utilise des tirets simples (-) ou des puces.
5. Si le contexte contient l'information, réponds de manière claire.
6. Si l'information n'est vraiment pas dans le contexte, dis poliment : "Je n'ai pas cette information dans les documents."

Contexte documentaire :
---
${context}
---`
    },
    // On ajoute l'historique de la conversation
    ...history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    })),
    // On ajoute la nouvelle question
    {
      role: "user",
      content: question
    }
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: messages,
      temperature: 0.4, // Un peu plus de créativité pour faire des phrases complètes
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Erreur API Groq :", errorData);
    throw new Error(errorData.error?.message || "Erreur API Groq");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
