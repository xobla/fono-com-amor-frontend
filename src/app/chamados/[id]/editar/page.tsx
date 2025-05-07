"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation"; // useParams para pegar o ID da URL

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface ChamadoEditForm {
  titulo: string;
  modulo: string;
  prioridade: "Baixa" | "Média" | "Alta";
  status: string;
  descricao: string;
  tags: string; 
  responsavelId?: string; // Opcional, para reatribuir
  // Adicionar outros campos que podem ser editados
}

interface User {
  _id: string;
  name: string;
  email: string;
  accessLevel: string;
}

export default function EditarChamadoPage() {
  const { token, user: currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const [formData, setFormData] = useState<ChamadoEditForm>({
    titulo: "",
    modulo: "",
    prioridade: "Média",
    status: "",
    descricao: "",
    tags: "",
    responsavelId: "",
  });
  const [loading, setLoading] = useState(true); // Inicia como true para carregar dados do chamado
  const [error, setError] = useState<string | null>(null);
  const [solicitanteNome, setSolicitanteNome] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]); // Para o select de responsável

  useEffect(() => {
    const fetchChamadoEUsuarios = async () => {
      if (token && ticketId) {
        try {
          setLoading(true);
          setError(null);
          // Buscar dados do chamado
          const chamadoRes = await axios.get(`${API_URL}/tickets/${ticketId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const chamadoData = chamadoRes.data;
          setFormData({
            titulo: chamadoData.titulo || "",
            modulo: chamadoData.modulo || "",
            prioridade: chamadoData.prioridade || "Média",
            status: chamadoData.status || "",
            descricao: chamadoData.descricao || "",
            tags: chamadoData.tags ? chamadoData.tags.join(", ") : "",
            responsavelId: chamadoData.responsavel?._id || "",
          });
          setSolicitanteNome(chamadoData.solicitante?.name || "N/A");

          // Buscar todos os usuários para o select de responsável (se o usuário for Admin/Gestor)
          // Esta rota /api/users/all precisaria ser criada no backend e protegida
          // if (currentUser && (currentUser.accessLevel === "Administrador" || currentUser.accessLevel === "Gestor")) {
          //   const usersRes = await axios.get(`${API_URL}/users/all`, { // Exemplo de endpoint
          //     headers: { Authorization: `Bearer ${token}` },
          //   });
          //   setAllUsers(usersRes.data);
          // }

        } catch (err: any) {
          console.error("Erro ao buscar dados para edição:", err);
          setError(err.response?.data?.message || "Falha ao carregar dados do chamado para edição.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchChamadoEUsuarios();
  }, [token, ticketId, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !ticketId) {
      setError("Não foi possível atualizar o chamado. Tente novamente.");
      return;
    }
    if (!formData.modulo) {
        setError("O campo Módulo é obrigatório.");
        return;
    }
    if (!formData.status) {
        setError("O campo Status é obrigatório.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
        // Se responsavelId for uma string vazia, não enviar para o backend ou enviar null
        responsavelId: formData.responsavelId || null, 
      };
      
      await axios.put(`${API_URL}/tickets/${ticketId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      router.push(`/chamados/${ticketId}`); // Redireciona para a página de detalhes após edição

    } catch (err: any) {
      console.error("Erro ao atualizar chamado:", err);
      setError(err.response?.data?.message || "Falha ao atualizar chamado. Verifique os campos e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.titulo) { // Mostra carregando apenas se os dados iniciais ainda não foram carregados
    return <div className="min-h-screen flex items-center justify-center"><p>Carregando dados do chamado...</p></div>;
  }

  if (error && !formData.titulo) { // Mostra erro se o carregamento inicial falhar
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <p className="text-xl text-vermelho mb-4">{error}</p>
        <Link href="/chamados" className="text-roxo-escuro hover:text-roxo-medio">
          &larr; Voltar para a Lista de Chamados
        </Link>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["Administrador", "Gestor", "Operador"]}> {/* Ajustar roles se necessário */}
      <div className="min-h-screen bg-gray-100 p-4">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-roxo-escuro">Editar Chamado #{ticketId.substring(0,6)}...</h1> {/* Mostrar ID curto ou sequentialId se disponível */}
          <Link href={`/chamados/${ticketId}`} className="text-roxo-escuro hover:text-roxo-medio">
            &larr; Voltar para Detalhes
          </Link>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <div>
            <label htmlFor="solicitante_view" className="block text-sm font-medium text-gray-700">
              Solicitante
            </label>
            <input
              type="text"
              name="solicitante_view"
              id="solicitante_view"
              value={solicitanteNome}
              disabled 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
              Título do Chamado <span className="text-vermelho">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              id="titulo"
              required
              value={formData.titulo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-roxo-medio focus:border-roxo-medio sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="modulo" className="block text-sm font-medium text-gray-700">
              Módulo <span className="text-vermelho">*</span>
            </label>
            <select
              id="modulo"
              name="modulo"
              required
              value={formData.modulo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-roxo-medio focus:border-roxo-medio sm:text-sm"
            >
              <option value="">Selecione o Módulo</option>
              <option value="Sistema">Sistema</option>
              <option value="Financeiro">Financeiro</option>
              <option value="Atendimento">Atendimento</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div>
            <label htmlFor="prioridade" className="block text-sm font-medium text-gray-700">
              Prioridade <span className="text-vermelho">*</span>
            </label>
            <select
              id="prioridade"
              name="prioridade"
              required
              value={formData.prioridade}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-roxo-medio focus:border-roxo-medio sm:text-sm"
            >
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status <span className="text-vermelho">*</span>
            </label>
            <select
              id="status"
              name="status"
              required
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-roxo-medio focus:border-roxo-medio sm:text-sm"
            >
              <option value="A Iniciar">A Iniciar</option>
              <option value="Iniciado">Iniciado</option>
              <option value="Aguardando Ivo">Aguardando Ivo (Informação do Usuário)</option>
              <option value="Aguardando FCA">Aguardando FCA (Clínica)</option>
              <option value="Concluído">Concluído</option>
              <option value="Abandonado">Abandonado</option>
            </select>
          </div>

          {/* TODO: Adicionar select para Responsável, visível para Admin/Gestor */}
          {/* Exemplo: 
          {(currentUser?.accessLevel === "Administrador" || currentUser?.accessLevel === "Gestor") && (
            <div>
              <label htmlFor="responsavelId" className="block text-sm font-medium text-gray-700">
                Responsável
              </label>
              <select
                id="responsavelId"
                name="responsavelId"
                value={formData.responsavelId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-roxo-medio focus:border-roxo-medio sm:text-sm"
              >
                <option value="">Ninguém atribuído</option>
                {allUsers.map(user => (
                  <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>
          )} 
          */}

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
              Descrição Detalhada <span className="text-vermelho">*</span>
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={6}
              required
              value={formData.descricao}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-roxo-medio focus:border-roxo-medio sm:text-sm"
            ></textarea>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              name="tags"
              id="tags"
              value={formData.tags}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-roxo-medio focus:border-roxo-medio sm:text-sm"
            />
          </div>
          
          {/* TODO: Implementar edição/upload de anexos */}

          {error && (
            <div className="text-sm text-vermelho bg-red-100 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Link href={`/chamados/${ticketId}`}>
              <button
                type="button" 
                className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-roxo-medio"
              >
                Cancelar
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-roxo-escuro hover:bg-roxo-medio focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-roxo-medio disabled:opacity-50"
            >
              {loading ? "Salvando Alterações..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}

