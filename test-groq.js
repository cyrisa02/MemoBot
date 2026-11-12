// test-groq.js
require('dotenv').config({ path: '.env.local' }); // Charge le fichier .env.local

async function testGroq() {
  const apiKey = process.env.GROQ_API_KEY;

  console.log("=== DÉBUT DU TEST ===");
  
  if (!apiKey) {
    console.error("❌ ERREUR : La variable GROQ_API_KEY est introuvable dans .env.local");
    return;
  }

  // On affiche le début et la fin de la clé pour vérifier s'il y a des espaces invisibles
  console.log(`🔑 Clé trouvée : commence par "${apiKey.substring(0, 7)}..." et finit par "...${apiKey.slice(-4)}"`);
  
  if (apiKey !== apiKey.trim()) {
    console.warn("⚠️ ATTENTION : Ta clé contient des espaces ou des sauts de ligne invisibles !");
  }

  try {
    console.log("📡 Appel de l'API Groq...");
    
    // Appel direct via fetch (intégré nativement à Node.js récent)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`, // On trim par sécurité
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: "Dis 'Test réussi'" }]
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCÈS ! Groq a répondu :", data.choices[0].message.content);
    } else {
      console.error("❌ ÉCHEC DE L'API GROQ.");
      console.error("Statut HTTP :", response.status);
      console.error("Détails de l'erreur :", JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error("❌ ERREUR RÉSEAU : Impossible de contacter les serveurs de Groq.");
    console.error(error.message);
  }
}

testGroq();
