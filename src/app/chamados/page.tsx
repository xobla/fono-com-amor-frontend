"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface Chamado {
  _id: string;
  sequentialId: number;
  titulo: string; // Adicionando explicitamente, embora não estivesse no exemplo original, mas é comum
  solicitante: { _id: string; name: string; email: string };
  responsavel?: { _id: string; name: string; email: string }; // Opcional
  prioridade: "Alta" | "Média" | "Baixa";
  modulo: string;
  status: string;
  createdAt: string; // Ou Date, se for converter
  slaDueDate?: string; // Ou Date
  // Adicionar outros campos conforme necessário
}

export default function ListaChamadosPage() {
  const { token } = useAuth();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loadingChamados, setLoadingChamados] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChamados = async () => {
      if (token) {
        try {
          setLoadingChamados(true);
          setError(null);
          const response = await axios.get(`${API_URL}/tickets`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setChamados(response.data);
        } catch (err: any) {
          console.error("Erro ao buscar chamados:", err);
          setError(err.response?.data?.message || "Falha ao carregar chamados.");
        } finally {
          setLoadingChamados(false);
        }
      }
    };
    fetchChamados();
  }, [token]);

  return (
    <ProtectedRoute allowedRoles={["Administrador", "Gestor", "Operador"]}>
      <div className="min-h-screen bg-gray-100 p-4">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-roxo-escuro">Lista de Chamados</h1>
          <div className="space-x-4">
            <Link href="/chamados/novo">
              <button className="px-4 py-2 bg-roxo-escuro text-white font-semibold rounded-lg shadow-md hover:bg-roxo-medio transition duration-300">
                Abrir Novo Chamado
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-300">
                Voltar ao Dashboard
              </button>
            </Link>
          </div>
        </header>

        {/* TODO: Adicionar filtros aqui (status, prioridade, módulo, responsável, etc.) */}
        <div className="mb-4 p-4 bg-white rounded-lg shadow">
          <p className="text-gray-600">Filtros avançados aqui...</p>
        </div>

        {loadingChamados && <p>Carregando chamados...</p>}
        {error && <p className="text-vermelho">Erro: {error}</p>}

        {!loadingChamados && !error && (
          <div className="bg-white p-2 rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abertura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chamados.length > 0 ? chamados.map((chamado) => (
                  <tr key={chamado._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{chamado.sequentialId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <Link href={`/chamados/${chamado._id}`} className="text-roxo-escuro hover:underline">
                        {chamado.titulo || "Chamado sem título"} 
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{chamado.solicitante?.name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{chamado.responsavel?.name || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${chamado.prioridade === "Alta" ? "bg-red-100 text-red-800" : chamado.prioridade === "Média" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}
                        `}
                      >
                        {chamado.prioridade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{chamado.modulo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{chamado.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(chamado.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{chamado.slaDueDate ? new Date(chamado.slaDueDate).toLocaleDateString("pt-BR") : "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/chamados/${chamado._id}/editar`} className="text-azul-claro hover:text-azul-escuro mr-2">
                        Editar
                      </Link>
                      {/* Adicionar outras ações como "Excluir" com confirmação */}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={10} className="text-center py-4">Nenhum chamado encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* TODO: Adicionar paginação aqui */}
      </div>
    </ProtectedRoute>
  );
}

