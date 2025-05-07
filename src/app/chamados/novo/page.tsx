"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, ChangeEvent } from "react"; // Adicionado ChangeEvent
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface NovoChamadoForm {
  titulo: string;
  modulo: string;
  prioridade: "Baixa" | "Média" | "Alta";
  descricao: string;
  tags: string; 
}

export default function NovoChamadoPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<NovoChamadoForm>({
    titulo: "",
    modulo: "",
    prioridade: "Média",
    descricao: "",
    tags: "",
  });
  const [anexos, setAnexos] = useState<FileList | null>(null); // Estado para os arquivos
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solicitanteNome, setSolicitanteNome] = useState("");

  useEffect(() => {
    if (user) {
      setSolicitanteNome(user.name);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAnexos(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !token) {
      setError("Você precisa estar logado para criar um chamado.");
      return;
    }
    if (!formData.modulo) {
        setError("O campo Módulo é obrigatório.");
        return;
    }

    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("titulo", formData.titulo);
    data.append("modulo", formData.modulo);
    data.append("prioridade", formData.prioridade);
    data.append("descricao", formData.descricao);
    data.append("solicitanteId", user._id);
    formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "").forEach(tag => {
      data.append("tags[]", tag); // Backend deve esperar um array de tags
    });

    if (anexos) {
      for (let i = 0; i < anexos.length; i++) {
        data.append("anexos", anexos[i]); // "anexos" deve ser o nome do campo esperado pelo backend para múltiplos arquivos
      }
    }

    try {
      const response = await axios.post(`${API_URL}/tickets`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Importante para upload de arquivos
        },
      });
      
      router.push(`/chamados/${response.data._id}`);

    } catch (err: any) {
      console.error("Erro ao criar chamado:", err);
      setError(err.response?.data?.message || "Falha ao criar chamado. Verifique os campos e tente novamente.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <ProtectedRoute allowedRoles={["Administrador", "Gestor", "Operador"]}>
      <div className="min-h-screen bg-gray-100 p-4">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-roxo-escuro">Abrir Novo Chamado</h1>
          <Link href="/dashboard" className="text-roxo-escuro hover:text-roxo-medio">
            &larr; Voltar para o Dashboard
          </Link>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <div>
            <label htmlFor="solicitante" className="block text-sm font-medium text-gray-700">
              Solicitante
            </label>
            <input
              type="text"
              name="solicitante"
              id="solicitante"
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
              placeholder="Ex: Erro ao salvar cliente"
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
              placeholder="Descreva o problema ou solicitação em detalhes..."
            ></textarea>
            {/* TODO: Adicionar editor Rich Text aqui */}
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
              placeholder="Ex: erro, sistema, urgente"
            />
          </div>
          
          <div>
            <label htmlFor="anexos_input" className="block text-sm font-medium text-gray-700">
              Anexos (imagens, documentos, etc.)
            </label>
            <input
              type="file"
              name="anexos_input"
              id="anexos_input"
              multiple
              onChange={handleFileChange} 
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-roxo-escuro file:text-white hover:file:bg-roxo-medio"
            />
          </div>

          {error && (
            <div className="text-sm text-vermelho bg-red-100 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Link href="/dashboard">
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
              {loading ? "Abrindo Chamado..." : "Abrir Chamado"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}

