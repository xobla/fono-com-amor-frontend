"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Anexo {
  _id?: string; // MongoDB ID
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt?: string | Date;
}

interface HistoricoItem {
  _id?: string;
  usuario: User;
  acao: string;
  detalhes?: any;
  justificativa?: string;
  data: string | Date;
}

interface Chamado {
  _id: string;
  sequentialId: number;
  titulo: string;
  solicitante: User;
  responsavel?: User;
  prioridade: "Alta" | "Média" | "Baixa";
  modulo: string;
  status: string;
  sistemaAtivo: boolean;
  descricao: string;
  dataAbertura?: string | Date; // Mantido como opcional se o backend já tiver createdAt
  createdAt: string | Date;
  updatedAt: string | Date;
  slaDueDate?: string | Date;
  tags: string[];
  anexos: Anexo[];
  historico: HistoricoItem[];
}

interface ChamadoDetalheProps {
  params: {
    id: string;
  };
}

export default function DetalheChamadoPage({ params }: ChamadoDetalheProps) {
  const { token, user: currentUser } = useAuth();
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [novoComentario, setNovoComentario] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchChamado = async () => {
      if (token && params.id) {
        try {
          setLoading(true);
          setError(null);
          const response = await axios.get(`${API_URL}/tickets/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setChamado(response.data);
        } catch (err: any) {
          console.error("Erro ao buscar detalhes do chamado:", err);
          setError(err.response?.data?.message || "Falha ao carregar detalhes do chamado.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchChamado();
  }, [token, params.id]);

  const handleAddComentario = async () => {
    if (!novoComentario.trim() || !chamado) return;
    try {
      const response = await axios.post(`${API_URL}/tickets/${chamado._id}/comment`, 
        { comentario: novoComentario, publico: true }, // Assumindo que comentários são públicos por padrão aqui
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChamado(response.data); // Atualiza o chamado com o novo histórico
      setNovoComentario("");
    } catch (err: any) {
      console.error("Erro ao adicionar comentário:", err);
      alert(err.response?.data?.message || "Falha ao adicionar comentário.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Carregando detalhes do chamado...</p></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <p className="text-xl text-vermelho mb-4">{error}</p>
        <Link href="/chamados" className="text-roxo-escuro hover:text-roxo-medio">
          &larr; Voltar para a Lista de Chamados
        </Link>
      </div>
    );
  }
  
  if (!chamado) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center justify-center">
        <p className="text-xl text-gray-700">Chamado não encontrado.</p>
        <Link href="/chamados" className="mt-4 text-roxo-escuro hover:text-roxo-medio">
          &larr; Voltar para a Lista de Chamados
        </Link>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["Administrador", "Gestor", "Operador"]}>
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-roxo-escuro">Detalhes do Chamado #{chamado.sequentialId}</h1>
            <p className="text-gray-600">{chamado.titulo}</p>
          </div>
          <div className="mt-4 md:mt-0 space-x-2">
            {/* TODO: Adicionar lógica de permissão para editar */}
            <Link href={`/chamados/${chamado._id}/editar`}>
              <button className="px-4 py-2 bg-azul-claro text-white font-semibold rounded-lg shadow-md hover:bg-azul-escuro transition duration-300">
                Editar Chamado
              </button>
            </Link>
            <Link href="/chamados">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-300">
                Voltar à Lista
              </button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-roxo-escuro mb-2">Descrição</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{chamado.descricao}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-roxo-escuro mb-2">Anexos</h2>
              {chamado.anexos && chamado.anexos.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {chamado.anexos.map((anexo) => (
                    <li key={anexo._id || anexo.fileName}>
                      <a href={API_URL.replace("/api","") + anexo.filePath} target="_blank" rel="noopener noreferrer" className="text-azul-claro hover:underline">
                        {anexo.fileName} ({anexo.fileType})
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Nenhum anexo.</p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-roxo-escuro mb-4">Histórico e Comentários</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {chamado.historico && chamado.historico.length > 0 ? chamado.historico.map((item) => (
                  <div key={item._id || new Date(item.data).toISOString()} className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-500">
                      {new Date(item.data).toLocaleString("pt-BR")} - {item.usuario?.name || "Sistema"}
                    </p>
                    <p className="font-medium text-gray-800">{item.acao}</p>
                    {item.detalhes?.comentario && (
                      <p className="text-gray-700 mt-1 whitespace-pre-wrap">{item.detalhes.comentario}</p>
                    )}
                     {item.justificativa && (
                      <p className="text-sm text-gray-600 mt-1"><i>Justificativa: {item.justificativa}</i></p>
                    )}
                  </div>
                )) : <p className="text-gray-500">Nenhum histórico ou comentário ainda.</p>}
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-roxo-escuro mb-2">Adicionar Comentário</h3>
                <textarea 
                  rows={4} 
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-roxo-medio focus:border-roxo-medio"
                  placeholder="Digite seu comentário aqui..."
                />
                <button 
                  onClick={handleAddComentario}
                  className="mt-2 px-4 py-2 bg-roxo-escuro text-white font-semibold rounded-lg shadow-md hover:bg-roxo-medio transition duration-300 disabled:opacity-50"
                  disabled={!novoComentario.trim()}
                >
                  Adicionar Comentário
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md space-y-4 h-fit">
            <h2 className="text-xl font-semibold text-roxo-escuro mb-3 border-b pb-2">Informações do Chamado</h2>
            <div>
              <strong>Status:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${chamado.status === "Concluído" ? "bg-green-100 text-green-800" : chamado.status === "Abandonado" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{chamado.status}</span>
            </div>
            <div><strong>Prioridade:</strong> {chamado.prioridade}</div>
            <div><strong>Módulo:</strong> {chamado.modulo}</div>
            <div><strong>Solicitante:</strong> {chamado.solicitante?.name || "N/A"} ({chamado.solicitante?.email || "N/A"})</div>
            <div><strong>Responsável:</strong> {chamado.responsavel ? `${chamado.responsavel.name} (${chamado.responsavel.email})` : "Não atribuído"}</div>
            <div><strong>Data de Abertura:</strong> {new Date(chamado.createdAt).toLocaleString("pt-BR")}</div>
            <div><strong>Última Atualização:</strong> {new Date(chamado.updatedAt).toLocaleString("pt-BR")}</div>
            <div><strong>Prazo SLA:</strong> {chamado.slaDueDate ? new Date(chamado.slaDueDate).toLocaleDateString("pt-BR") : "-"}</div>
            <div><strong>Sistema Ativo:</strong> {chamado.sistemaAtivo ? "Sim" : "Não"}</div>
            <div>
              <strong>Tags:</strong> 
              {chamado.tags && chamado.tags.length > 0 ? chamado.tags.join(", ") : "Nenhuma"}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

