export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center space-y-6">
        
        {/* Bloc d'informations légales et contact */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-800">
            ESSOR Cyril GOURDON - AlicIA-GPT
          </p>
          <p className="text-xs text-gray-600">Consultant IA</p>
          <p className="text-xs text-gray-600">
            <a href="mailto:contact@alicia-gpt.com" className="hover:text-blue-600 transition-colors">contact@alicia-gpt.com</a> 
            <span className="mx-2">|</span>
            <a href="https://www.alicia-gpt.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">www.alicia-gpt.com</a>
          </p>
          <p className="text-xs text-gray-500 mt-2">SIRET : 827 987 595 00028</p>
        </div>

        {/* Mention Prototype / Jina AI */}
        <div className="bg-blue-50 text-blue-800 text-xs px-4 py-2 rounded-lg max-w-2xl border border-blue-100">
          <p>
            <strong>Prototype :</strong> Ce projet utilise l'API gratuite de <strong>Jina AI</strong> pour la vectorisation et <strong>Groq</strong> pour la génération. 
            Il est conçu pour rester dans les limites des plans gratuits à des fins de démonstration.
          </p>
        </div>

        {/* Liens légaux (repris du screenshot) */}
        <div className="flex items-center gap-4 text-xs text-gray-500 border-b border-gray-200 pb-4 w-full justify-center">
          <a href="#" className="hover:text-gray-800 underline">Mentions légales</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-800 underline">Politique de confidentialité</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-800 underline">CGU</a>
        </div>

        {/* Copyright et Made with love */}
        <div className="text-xs text-gray-400 space-y-2">
          <p>© 2026 AlicIA-GPT. Tous droits réservés.</p>
          <p className="flex items-center justify-center gap-1">
            Made with <span className="text-red-500">❤️</span> in Soissons 🇫🇷
          </p>
        </div>

      </div>
    </footer>
  );
}
