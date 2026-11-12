"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  
  // États pour la liste des documents
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Fonction pour charger les documents
  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (res.ok) setDocuments(data);
    } catch (error) {
      console.error("Erreur chargement docs:", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Charge les documents au montage du composant
  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage(`✅ Succès : ${data.message}`);
        setFile(null);
        fetchDocuments(); // On rafraîchit la liste après l'upload
      } else {
        setMessage(`❌ Erreur : ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Erreur réseau lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ? Toutes les données associées seront perdues.")) return;

    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDocuments(); // Rafraîchit la liste
        setMessage("🗑️ Document supprimé avec succès.");
      }
    } catch (error) {
      setMessage("❌ Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Espace Administration</h1>
            <p className="text-gray-500 mt-1">Gérez la base de connaissances de votre entreprise</p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            ← Retour au Chatbot
          </Link>
        </div>

        {/* Formulaire d'upload */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ajouter un document</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? "Analyse et vectorisation en cours..." : "Ajouter à la base"}
            </button>
          </form>
          {message && <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">{message}</div>}
        </div>

        {/* Liste des documents */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Documents dans la base</h2>
          
          {loadingDocs ? (
            <p className="text-gray-500 text-sm">Chargement...</p>
          ) : documents.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Aucun document pour le moment.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <li key={doc.id} className="py-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-medium text-gray-800">{doc.name}</p>
                      <p className="text-xs text-gray-400">
                        Ajouté le {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
