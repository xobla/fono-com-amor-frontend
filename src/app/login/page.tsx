"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation"; // Para redirecionamento

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      router.push("/dashboard"); // Redireciona para o dashboard após login bem-sucedido
    } catch (err: any) {
      console.error("Falha no login:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Ocorreu um erro ao tentar fazer login. Tente novamente.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-roxo-escuro mb-8">
          Fono com Amor - Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email_login" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email_login"
              name="email_login"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-roxo-medio focus:border-roxo-medio sm:text-sm"
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password_login" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password_login"
              name="password_login"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-roxo-medio focus:border-roxo-medio sm:text-sm"
              placeholder="Sua senha"
            />
          </div>

          {error && (
            <div className="text-sm text-vermelho bg-red-100 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-roxo-escuro focus:ring-roxo-medio border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Lembrar-me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/recuperar-senha" className="font-medium text-roxo-escuro hover:text-roxo-medio">
                Esqueceu sua senha?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-roxo-escuro hover:bg-roxo-medio focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-roxo-medio disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Não tem uma conta?{" "}
          <Link href="/registro" className="font-medium text-roxo-escuro hover:text-roxo-medio">
            Registre-se
          </Link>
        </p>
      </div>
    </div>
  );
}

