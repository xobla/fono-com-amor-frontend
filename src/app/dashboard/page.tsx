"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface Kpi {
  title: string;
  value: string;
  change?: string;
  color: string;
}

// Interfaces para os dados dos gráficos (exemplos)
interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [kpiData, setKpiData] = useState<Kpi[]>([]);
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [chamadosPorStatusData, setChamadosPorStatusData] = useState<ChartData | null>(null);
  const [distribuicaoPorModuloData, setDistribuicaoPorModuloData] = useState<ChartData | null>(null);
  const [evolucaoTemporalData, setEvolucaoTemporalData] = useState<ChartData | null>(null);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (token) {
        try {
          setLoadingKpis(true);
          setLoadingCharts(true);

          // Buscar KPIs (exemplo, ajustar endpoint)
          // const kpiRes = await axios.get(`${API_URL}/dashboard/kpis`, { headers: { Authorization: `Bearer ${token}` } });
          // setKpiData(kpiRes.data);
          setKpiData([
            { title: "Chamados Abertos (API)", value: "15", change: "+1 hoje", color: "bg-azul-claro" },
            { title: "Chamados Concluídos (Mês)", value: "42", color: "bg-green-500" },
            { title: "Tempo Médio de Resolução", value: "1.9 dias", color: "bg-yellow-500" },
            { title: "SLA Cumprido", value: "98%", color: "bg-roxo-medio" },
          ]);
          setLoadingKpis(false);

          // Buscar dados para os gráficos (exemplos, ajustar endpoints)
          // const statusRes = await axios.get(`${API_URL}/dashboard/chamados-status`, { headers: { Authorization: `Bearer ${token}` } });
          // setChamadosPorStatusData(statusRes.data);
          setChamadosPorStatusData({
            labels: ["A Iniciar", "Iniciado", "Aguardando FCA", "Concluído"],
            datasets: [
              {
                label: "Nº de Chamados",
                data: [5, 8, 2, 20],
                backgroundColor: ["#37A6DE", "#FFCE56", "#FF6384", "#4BC0C0"],
              },
            ],
          });

          // const moduloRes = await axios.get(`${API_URL}/dashboard/chamados-modulo`, { headers: { Authorization: `Bearer ${token}` } });
          // setDistribuicaoPorModuloData(moduloRes.data);
          setDistribuicaoPorModuloData({
            labels: ["Sistema", "Financeiro", "Atendimento", "Administrativo"],
            datasets: [
              {
                label: "Distribuição por Módulo",
                data: [12, 7, 10, 5],
                backgroundColor: ["#613B8E", "#684192", "#37A6DE", "#0991C6"],
              },
            ],
          });

          // const evolucaoRes = await axios.get(`${API_URL}/dashboard/chamados-evolucao`, { headers: { Authorization: `Bearer ${token}` } });
          // setEvolucaoTemporalData(evolucaoRes.data);
          setEvolucaoTemporalData({
            labels: ["Jan", "Fev", "Mar", "Abr", "Mai"],
            datasets: [
              {
                label: "Chamados Criados",
                data: [10, 12, 8, 15, 20],
                borderColor: "#613B8E",
                backgroundColor: "rgba(97, 59, 142, 0.2)",
                fill: true,
              },
              {
                label: "Chamados Concluídos",
                data: [8, 10, 7, 12, 18],
                borderColor: "#37A6DE",
                backgroundColor: "rgba(55, 166, 222, 0.2)",
                fill: true,
              },
            ],
          });

        } catch (error) {
          console.error("Erro ao buscar dados do dashboard:", error);
        } finally {
          setLoadingKpis(false);
          setLoadingCharts(false);
        }
      }
    };
    fetchDashboardData();
  }, [token]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Título do Gráfico", // Será sobrescrito no componente
      },
    },
  };

  return (
    <ProtectedRoute allowedRoles={["Administrador", "Gestor", "Operador"]}>
      <div className="min-h-screen bg-gray-100 p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-roxo-escuro">Dashboard Gerencial</h1>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loadingKpis ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-6 rounded-lg shadow-lg bg-gray-300 animate-pulse h-32"></div>
            ))
          ) : kpiData.length > 0 ? (
            kpiData.map((kpi, index) => (
              <div key={index} className={`p-6 rounded-lg shadow-lg text-white ${kpi.color}`}>
                <h2 className="text-xl font-semibold">{kpi.title}</h2>
                <p className="text-4xl font-bold my-2">{kpi.value}</p>
                {kpi.change && <p className="text-sm">{kpi.change}</p>}
              </div>
            ))
          ) : (
            <p>Nenhum dado de KPI para exibir.</p>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg h-96">
            <h3 className="text-xl font-semibold text-roxo-escuro mb-4">Chamados por Status</h3>
            {loadingCharts || !chamadosPorStatusData ? (
              <div className="h-full bg-gray-200 flex items-center justify-center animate-pulse"><p className="text-gray-500">Carregando...</p></div>
            ) : (
              <Bar options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text:"Chamados por Status"}}}} data={chamadosPorStatusData} />
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg h-96">
            <h3 className="text-xl font-semibold text-roxo-escuro mb-4">Distribuição por Módulo</h3>
            {loadingCharts || !distribuicaoPorModuloData ? (
              <div className="h-full bg-gray-200 flex items-center justify-center animate-pulse"><p className="text-gray-500">Carregando...</p></div>
            ) : (
              <Pie options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text:"Distribuição por Módulo"}}}} data={distribuicaoPorModuloData} />
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg h-96">
            <h3 className="text-xl font-semibold text-roxo-escuro mb-4">Evolução Temporal de Chamados</h3>
            {loadingCharts || !evolucaoTemporalData ? (
              <div className="h-full bg-gray-200 flex items-center justify-center animate-pulse"><p className="text-gray-500">Carregando...</p></div>
            ) : (
              <Line options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text:"Evolução Temporal de Chamados"}}}} data={evolucaoTemporalData} />
            )}
          </div>
        </section>
        
        <div className="mt-8">
          <Link href="/chamados/novo" className="px-6 py-3 bg-roxo-escuro text-white font-semibold rounded-lg shadow-md hover:bg-roxo-medio transition duration-300">
            Abrir Novo Chamado
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}

