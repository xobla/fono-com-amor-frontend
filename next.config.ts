import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suas outras configurações do Next.js podem estar aqui, se houver
  eslint: {
    // Aviso: Isso permite que builds de produção sejam concluídos com sucesso mesmo que
    // seu projeto tenha erros de ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
