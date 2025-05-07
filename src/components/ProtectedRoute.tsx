"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'Administrador' | 'Gestor' | 'Operador'>; // Opcional: para controle de acesso baseado em roles
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!token || !user) {
        router.push('/login');
      } else if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.accessLevel)) {
        // Se roles são especificadas e o usuário não tem a role permitida, redireciona para uma página de não autorizado ou dashboard
        // Por simplicidade, vamos redirecionar para o dashboard, mas idealmente seria uma página de "Acesso Negado"
        console.warn(`Usuário ${user.email} com role ${user.accessLevel} tentou acessar uma rota protegida para ${allowedRoles.join(', ')}`);
        router.push('/dashboard'); // Ou uma página específica de acesso negado
      }
    }
  }, [user, token, loading, router, allowedRoles]);

  if (loading) {
    // Pode mostrar um spinner de carregamento global aqui
    return <div className="min-h-screen flex items-center justify-center"><p>Carregando...</p></div>;
  }

  if (!token || !user) {
    // Se ainda não foi redirecionado (useEffect pode demorar um ciclo), não renderiza children
    return null; 
  }

  // Se roles são especificadas e o usuário não tem a role permitida
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.accessLevel)) {
    return <div className="min-h-screen flex items-center justify-center"><p>Acesso Negado. Você não tem permissão para ver esta página.</p></div>; // Ou null para não renderizar nada até o redirect do useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;

