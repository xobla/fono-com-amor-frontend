```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

// Metadata não pode estar em um client component, então se AuthProvider forçar o layout a ser client,
// pode ser necessário mover Metadata para um componente de servidor pai ou para a page.tsx individualmente.
// No entanto, como AuthProvider envolve {children}, o layout em si pode permanecer um Server Component
// se AuthProvider for corretamente implementado para não quebrar essa regra.
// Se AuthProvider precisar ser "use client", e envolver todo o HTML, então Metadata precisa ser ajustado.
// Por agora, vamos assumir que AuthProvider pode ser usado desta forma.

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
        <AuthProvider>
          {/* Aqui poderia entrar um Header/Navbar global que use o contexto de autenticação */}
          <main className="container mx-auto p-4">
            {children}
          </main>
          {/* Aqui poderia entrar um Footer global */}
        </AuthProvider>
      </body>
    </html>
  );
}

