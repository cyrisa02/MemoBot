export async function generateAnswer(question: string, context: string, history: any[] = []) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) throw new Error("GROQ_API_KEY manquante");

  // On prépare les messages avec l'historique
  const messages = [
    {
      role: "system",
      content: `Tu es un assistant strict. Ton unique rôle est de répondre aux questions en te basant EXCLUSIVEMENT sur les documents fournis ci-dessous.

RÈGLES IMPORTANTES ABSOLUES:
1. N'utilise JAMAIS tes connaissances générales. Si l'information n'est pas écrite noir sur blanc dans le contexte, tu ne la connais pas.
2. Si on te demande une définition (ex: "qu'est-ce qu'une facture ?"), cherche la définition EXACTE donnée dans les documents. Ne donne pas la définition du dictionnaire.
3. Si le contexte mentionne des factures clients et des factures fournisseurs, fais très attention à ne pas les mélanger. Cite le document pour justifier ta réponse.
4. Fais des phrases complètes et détaillées. Ne réponds pas juste par un mot.
5. Si la question est vague (ex: "que fait-on avec ?"), utilise l'historique de la conversation pour comprendre de quoi on parle.
6. N'utilise JAMAIS de balises HTML (comme <br>, <b>, etc.).
7. Si tu dois faire une liste, utilise des tirets simples (-) ou des puces.
8. Si le contexte contient l'information, réponds de manière claire.
9. Si l'information n'est vraiment pas dans le contexte, dis poliment : "Je n'ai pas cette information dans les documents."
10. Evolbee n'est pas une plateforme de communication. Il faut communiquer par téléphone ou par mail tout simplement.

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
      temperature: 0.1, // Un peu plus de créativité pour faire des phrases complètes
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
