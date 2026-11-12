export async function generateAnswer(question: string, context: string) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error("GROQ_API_KEY est introuvable dans les variables d'environnement");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant d'entreprise utile et précis.
Tu dois répondre à la question de l'utilisateur en te basant UNIQUEMENT sur le contexte fourni ci-dessous.
Si le contexte contient l'information, réponds de manière claire et directe.
Si le contexte ne contient VRAIMENT PAS l'information, dis simplement : "Je n'ai pas cette information dans les documents."

Voici les documents de l'entreprise :
---
${context}
---`
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Erreur API Groq :", errorData);
    throw new Error(errorData.error?.message || "Erreur lors de l'appel à Groq");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
