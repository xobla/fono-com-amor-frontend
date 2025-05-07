import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders"; // Certifique-se que está importando ClientProviders

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fono com Amor - Gestão de Chamados",
  description: "Sistema de Gestão de Chamados para a clínica Fono com Amor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-100`}>
        <ClientProviders> {/* Certifique-se que está usando ClientProviders aqui */}
          <main className="container mx-auto p-4">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
