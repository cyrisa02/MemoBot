import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer"; // <-- Import du Footer

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MemoBot ESSOR",
  description: "Votre assistant interne sécurisé",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* Le contenu principal prend tout l'espace disponible */}
        <div className="flex-1">
          {children}
        </div>
        {/* Le footer est ajouté ici, il sera présent sur toutes les pages */}
        <Footer />
      </body>
    </html>
  );
}
