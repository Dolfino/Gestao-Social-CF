import React, { useState, useEffect } from 'react';
import { User, MetaConfig, EnvironmentUrls } from './types.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar, ActiveTab } from './components/Sidebar.js';
import { LoginView } from './pages/LoginView.js';
import { DashboardOverview } from './pages/DashboardOverview.js';
import { MetaConfigView } from './pages/MetaConfigView.js';
import { AuditLogsView } from './pages/AuditLogsView.js';
import { AppReviewPreparer } from './pages/AppReviewPreparer.js';
import { ConnectedAccountsView } from './pages/ConnectedAccountsView.js';
import { PostsManagementView } from './pages/PostsManagementView.js';
import { PendingModuleView } from './pages/PendingModuleView.js';
import { ChangePasswordModal } from './components/ChangePasswordModal.js';
import { PrivacyPolicyView } from './pages/public/PrivacyPolicyView.js';
import { TermsView } from './pages/public/TermsView.js';
import { DataDeletionView } from './pages/public/DataDeletionView.js';

import { safeStorage } from './utils/storage.js';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [publicPage, setPublicPage] = useState<'privacy' | 'terms' | 'deletion' | null>(null);
  const [metaConfig, setMetaConfig] = useState<MetaConfig | null>(null);
  const [envUrls, setEnvUrls] = useState<EnvironmentUrls | null>(null);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(() => {
    try {
      return Boolean(safeStorage.getItem('cf_token'));
    } catch {
      return false;
    }
  });
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Detecção de rotas públicas diretas pela URL (ex.: /privacidade, /termos, /exclusao-dados)
  useEffect(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('privacidade')) {
        setPublicPage('privacy');
      } else if (path.includes('termos')) {
        setPublicPage('terms');
      } else if (path.includes('exclusao-dados') || path.includes('data-deletion')) {
        setPublicPage('deletion');
      }
    } catch {
      // Ignora erro em ambientes de visualização restritos
    }
  }, []);

  // Busca URLs públicas de ambiente
  const fetchEnvUrls = async () => {
    try {
      const originParam = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
      const res = await fetch(`/api/meta/environment?origin=${originParam}`);
      if (res.ok) {
        const data = await res.json();
        setEnvUrls(data);
      }
    } catch (err) {
      console.error('Falha ao obter URLs de ambiente:', err);
    }
  };

  // Busca dados de configuração da Meta (requer autenticação)
  const fetchMetaConfig = async (token: string) => {
    try {
      const res = await fetch('/api/meta/config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMetaConfig(data);
      }
    } catch (err) {
      console.error('Falha ao obter configurações da Meta:', err);
    }
  };

  // Validação resiliente de sessão no carregamento inicial (sempre destrava a interface)
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Dispara busca das URLs de ambiente sem bloquear o login
        fetchEnvUrls();

        const token = safeStorage.getItem('cf_token');
        if (token) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${token}` },
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              if (isMounted) {
                setUser(data.user);
              }
              // Carrega config da Meta em background
              fetchMetaConfig(token);
            } else {
              safeStorage.removeItem('cf_token');
            }
          } catch {
            safeStorage.removeItem('cf_token');
          }
        }
      } catch (err) {
        console.error('Erro na inicialização da autenticação:', err);
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = async (loggedUser: User, token: string) => {
    setUser(loggedUser);
    await fetchMetaConfig(token);
    await fetchEnvUrls();
    setActiveTab('overview');
  };

  const handleLogout = async () => {
    const token = safeStorage.getItem('cf_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignora erro no logout
      }
    }
    safeStorage.removeItem('cf_token');
    setUser(null);
    setMetaConfig(null);
    setActiveTab('overview');
  };

  // Se o usuário estiver acessando uma página pública regulatória
  if (publicPage === 'privacy') {
    return <PrivacyPolicyView onBack={() => setPublicPage(null)} />;
  }
  if (publicPage === 'terms') {
    return <TermsView onBack={() => setPublicPage(null)} />;
  }
  if (publicPage === 'deletion') {
    return <DataDeletionView onBack={() => setPublicPage(null)} />;
  }

  // Estado de carregamento inicial
  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#F4F5F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#171B68] text-white flex items-center justify-center font-bold text-lg animate-pulse">
            CF
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Carregando Centro Fashion Fortaleza...
          </span>
        </div>
      </div>
    );
  }

  // Se não estiver logado, exibe tela de login interno
  if (!user) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onNavigatePublic={(page) => setPublicPage(page)}
      />
    );
  }

  const getTitleByTab = (tab: ActiveTab) => {
    switch (tab) {
      case 'overview':
        return 'Visão Geral & Integridade';
      case 'config':
        return 'Configurações Meta API';
      case 'audit':
        return 'Auditoria & Logs';
      case 'app_review':
        return 'Preparador App Review';
      case 'accounts':
        return 'Contas Conectadas (Etapa 2)';
      case 'posts':
        return 'Publicações (Etapa 3)';
      case 'comments':
        return 'Comentários (Etapa 4)';
      case 'messages':
        return 'Atendimento SAC (Etapa 5)';
      case 'insights':
        return 'Métricas & Insights (Etapa 6)';
      default:
        return 'Painel';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F8] flex flex-col antialiased">
      {/* Top Bar Contract */}
      <Navbar
        user={user}
        currentViewTitle={getTitleByTab(activeTab)}
        onLogout={handleLogout}
        onNavigatePublic={(page) => setPublicPage(page)}
        onChangePassword={() => setIsChangePasswordOpen(true)}
      />

      {/* Modal de Troca Segura de Senha */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Área Principal: Sidebar + Conteúdo */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          userRole={user.role}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'overview' && (
            <DashboardOverview
              user={user}
              metaConfig={metaConfig}
              envUrls={envUrls}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'config' && (
            <MetaConfigView
              user={user}
              metaConfig={metaConfig}
              envUrls={envUrls}
              onRefreshConfig={(updated) => {
                if (updated) setMetaConfig(updated);
                const token = safeStorage.getItem('cf_token');
                if (token) fetchMetaConfig(token);
              }}
            />
          )}

          {activeTab === 'accounts' && (
            <ConnectedAccountsView
              user={user}
              metaConfig={metaConfig}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'audit' && <AuditLogsView />}

          {activeTab === 'app_review' && <AppReviewPreparer />}

          {activeTab === 'posts' && (
            <PostsManagementView
              user={user}
              onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
            />
          )}

          {(activeTab === 'comments' ||
            activeTab === 'messages' ||
            activeTab === 'insights') && (
            <PendingModuleView
              tab={activeTab}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
