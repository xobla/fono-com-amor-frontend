import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "roxo-escuro": "#613B8E",
        "roxo-medio": "#684192",
        "azul-claro": "#37A6DE",
        "azul-escuro": "#0991C6",
        "vermelho": "#E10B17",
      },
      // Adicionar aqui a configuração de tipografia se necessário, 
      // ou configurar no CSS global e aplicar classes do Tailwind.
      fontFamily: {
        // Exemplo: sans: ["Inter", "sans-serif"], (precisa importar a fonte no layout)
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
