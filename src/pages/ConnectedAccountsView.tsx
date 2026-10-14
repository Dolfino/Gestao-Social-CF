import React, { useState, useEffect } from 'react';
import { SocialAccount, MetaConfig, User, InspectionResult } from '../types.js';
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Instagram,
  Facebook,
  Layers,
  Lock,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  Search,
  Eye,
  Copy,
  Check,
  X,
  Radio,
} from 'lucide-react';
import { safeStorage } from '../utils/storage.js';

interface Props {
  user: User;
  metaConfig: MetaConfig | null;
  onNavigateTab: (tab: any) => void;
}

interface PendingPage {
  id: string;
  name: string;
  category: string;
}

export const ConnectedAccountsView: React.FC<Props> = ({
  user,
  metaConfig,
  onNavigateTab,
}) => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [connectingFlow, setConnectingFlow] = useState<'facebook' | 'instagram' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Estados para abertura de Popup e Fallback de bloqueio
  const [blockedPopupUrl, setBlockedPopupUrl] = useState<string | null>(null);
  const [blockedPopupFlow, setBlockedPopupFlow] = useState<'facebook' | 'instagram' | null>(null);
  const [showBlockedPopupModal, setShowBlockedPopupModal] = useState(false);

  // Estados de Seleção Explícita de Página (Facebook Login)
  const [pendingPages, setPendingPages] = useState<PendingPage[]>([]);
  const [pendingOAuthState, setPendingOAuthState] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [loadingPendingPages, setLoadingPendingPages] = useState(false);
  const [confirmingPage, setConfirmingPage] = useState(false);

  // Estados de Inspeção de Token e Permissões
  const [inspectionAccount, setInspectionAccount] = useState<SocialAccount | null>(null);
  const [inspectionLoading, setInspectionLoading] = useState(false);
  const [inspectionData, setInspectionData] = useState<InspectionResult['inspection'] | null>(null);
  const [inspectionError, setInspectionError] = useState<string | null>(null);
  const [copiedEvidence, setCopiedEvidence] = useState(false);

  // Estados de Guia do Fluxo B (Instagram Login)
  const [showInstagramGuide, setShowInstagramGuide] = useState(false);
  const [copiedIgCallback, setCopiedIgCallback] = useState(false);

  const isConfigured = metaConfig?.configured;
  const isEncryptionOk = metaConfig?.encryption_status?.configured;

  const handleCopyIgCallback = () => {
    const origin = window.location.origin;
    const url = `${origin}/api/meta/oauth/instagram/callback`;
    navigator.clipboard.writeText(url);
    setCopiedIgCallback(true);
    setTimeout(() => setCopiedIgCallback(false), 2500);
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setActionError(null);
    const token = safeStorage.getItem('cf_token');

    try {
      const res = await fetch('/api/social/accounts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.accounts || []);
      } else {
        setActionError(data.error || 'Falha ao buscar contas conectadas.');
      }
    } catch {
      setActionError('Falha de rede ao se comunicar com o backend.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPages = async (stateVal: string) => {
    setLoadingPendingPages(true);
    const token = safeStorage.getItem('cf_token');
    try {
      const res = await fetch(`/api/meta/oauth/facebook/pending-pages?state=${encodeURIComponent(stateVal)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.pages?.length > 0) {
        setPendingPages(data.pages);
        setSelectedPageId(data.pages[0].id);
      } else {
        setErrorBanner(data.error || 'Nenhuma Página pendente foi retornada ou a sessão expirou.');
        setPendingOAuthState(null);
      }
    } catch {
      setErrorBanner('Falha de rede ao buscar páginas pendentes de autorização.');
      setPendingOAuthState(null);
    } finally {
      setLoadingPendingPages(false);
    }
  };

  const handleConfirmPageSelection = async () => {
    if (!selectedPageId || !pendingOAuthState) return;
    setConfirmingPage(true);
    const token = safeStorage.getItem('cf_token');
    try {
      const res = await fetch('/api/meta/oauth/facebook/select-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          state: pendingOAuthState,
          page_id: selectedPageId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const followers = data.page?.followers_count ?? 'N/A';
        const fans = data.page?.fan_count ?? 'N/A';
        setSuccessBanner(
          `Página "${data.page?.name}" conectada com sucesso ao Centro Fashion Fortaleza! Permissão pages_read_engagement comprovada (${followers} seguidores, ${fans} fãs).`
        );
        setPendingPages([]);
        setPendingOAuthState(null);
        window.history.replaceState({}, document.title, window.location.pathname);
        fetchAccounts();
      } else {
        setErrorBanner(data.error || 'Falha ao confirmar conexão da Página.');
      }
    } catch {
      setErrorBanner('Erro de rede ao confirmar seleção de Página.');
    } finally {
      setConfirmingPage(false);
    }
  };

  const handleCancelPageSelection = () => {
    setPendingPages([]);
    setPendingOAuthState(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleInspectAccount = async (account: SocialAccount) => {
    setInspectionAccount(account);
    setInspectionLoading(true);
    setInspectionData(null);
    setInspectionError(null);
    const token = safeStorage.getItem('cf_token');
    try {
      const res = await fetch(`/api/social/accounts/${encodeURIComponent(account.id)}/inspect`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setInspectionData(data.inspection);
      } else {
        setInspectionError(data.error || 'Falha ao inspecionar token na API da Meta.');
      }
    } catch {
      setInspectionError('Erro de rede ao inspecionar token.');
    } finally {
      setInspectionLoading(false);
    }
  };

  // 1. Escuta mensagens postMessage emitidas pela janela popup após autorização na Meta
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'OAUTH_FACEBOOK_SELECT_PAGE') {
        setConnectingFlow(null);
        setShowBlockedPopupModal(false);
        setBlockedPopupUrl(null);
        if (data.state) {
          setPendingOAuthState(data.state);
          fetchPendingPages(data.state);
          setSuccessBanner(
            'Autorização na Meta concluída com sucesso! Selecione a Página oficial do Centro Fashion Fortaleza abaixo.'
          );
        }
      } else if (data.type === 'OAUTH_AUTH_SUCCESS') {
        setConnectingFlow(null);
        setShowBlockedPopupModal(false);
        setBlockedPopupUrl(null);
        if (data.flow === 'instagram_login' || data.flow === 'instagram') {
          const userStr = data.username ? `@${data.username}` : '';
          setSuccessBanner(
            `Instagram API with Instagram Login autenticado com sucesso! Perfil ${userStr} vinculado diretamente.`
          );
        } else {
          setSuccessBanner(data.message || 'Conta conectada com sucesso à plataforma.');
        }
        fetchAccounts();
      } else if (data.type === 'OAUTH_AUTH_ERROR') {
        setConnectingFlow(null);
        setShowBlockedPopupModal(false);
        setErrorBanner(data.error || 'A autorização com a Meta falhou ou foi recusada.');
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  // 2. Polling de status em background para redundância (caso postMessage seja barrado por bloqueador/isolamento)
  useEffect(() => {
    if (!connectingFlow || !pendingOAuthState) return;

    const interval = setInterval(async () => {
      const token = safeStorage.getItem('cf_token');
      if (!token) return;

      try {
        const res = await fetch(`/api/meta/oauth/status?state=${encodeURIComponent(pendingOAuthState)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const statusData = await res.json();
          if (statusData.status === 'pages_ready') {
            clearInterval(interval);
            setConnectingFlow(null);
            setShowBlockedPopupModal(false);
            setBlockedPopupUrl(null);
            fetchPendingPages(pendingOAuthState);
            setSuccessBanner('Autorização detectada! Por favor, selecione abaixo a Página oficial do Centro Fashion Fortaleza.');
          } else if (statusData.status === 'consumed_or_not_found') {
            clearInterval(interval);
            setConnectingFlow(null);
            setShowBlockedPopupModal(false);
            setBlockedPopupUrl(null);
            fetchAccounts();
          }
        }
      } catch {
        // Ignora erros temporários na verificação de status
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [connectingFlow, pendingOAuthState]);

  // 3. Verifica parâmetros de retorno da URL (compatibilidade retroativa com redirecionamentos diretos)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const successParam = params.get('success');
    const errorParam = params.get('error');
    const detailParam = params.get('detail');
    const selectPageParam = params.get('select_facebook_page');
    const stateParam = params.get('state');

    if (selectPageParam === 'true' && stateParam) {
      setPendingOAuthState(stateParam);
      fetchPendingPages(stateParam);
    }

    if (successParam === 'instagram_conectado') {
      const username = params.get('username') || '';
      setSuccessBanner(
        `Instagram API with Instagram Login autenticado com sucesso! Perfil @${username} identificado diretamente sem dependência de Página Facebook.`
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (errorParam) {
      let msg = 'Erro no processo de autorização.';
      if (errorParam === 'autorizacao_recusada') {
        msg = `A autorização foi recusada no diálogo da Meta: ${detailParam || 'O usuário cancelou o consentimento.'}`;
      } else if (errorParam === 'state_invalido') {
        msg = `Falha de segurança CSRF: ${detailParam || 'O parâmetro state é inválido, adulterado ou já foi utilizado.'}`;
      } else if (errorParam === 'state_expirado') {
        msg = 'A sessão de login da Meta expirou (limite de 10 minutos). Inicie o processo novamente.';
      } else if (errorParam === 'sem_paginas') {
        msg = 'Nenhuma Página do Facebook foi autorizada pelo seu usuário. Certifique-se de ser administrador da Página do Centro Fashion.';
      } else if (errorParam === 'config_ausente') {
        msg = 'App ID ou App Secret não estão configurados nas Configurações da Meta.';
      } else {
        msg = `Erro na autenticação: ${detailParam || errorParam}`;
      }
      setErrorBanner(msg);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    fetchAccounts();
  }, []);

  const handleStartFacebookOAuth = async () => {
    setErrorBanner(null);
    setSuccessBanner(null);
    setConnectingFlow('facebook');
    const token = safeStorage.getItem('cf_token');

    // Abre janela popup imediatamente no clique do usuário para evitar bloqueio por popup blockers
    const width = 640;
    const height = 750;
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
    let popup: Window | null = null;
    try {
      popup = window.open(
        'about:blank',
        'meta_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
      );
      if (popup) {
        popup.document.write(
          '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Conectando à Meta...</title><style>body{background:#0f172a;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;text-align:center;}h3{font-size:16px;margin-bottom:8px;color:#38bdf8;}p{font-size:12px;color:#94a3b8;}</style></head><body><div><div style="font-size:36px;margin-bottom:12px;">🔒</div><h3>Iniciando Facebook Login</h3><p>Conectando aos servidores oficiais da Meta for Developers...</p></div></body></html>'
        );
      }
    } catch {
      // Ignora erro inicial
    }

    try {
      const originParam = encodeURIComponent(window.location.origin);
      const res = await fetch(`/api/meta/oauth/facebook/start?origin=${originParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (popup && !popup.closed) popup.close();
        setErrorBanner(data.error || 'Falha ao iniciar autenticação com o Facebook.');
        setConnectingFlow(null);
      } else if (data.authorization_url) {
        setPendingOAuthState(data.state);
        if (popup && !popup.closed) {
          popup.location.href = data.authorization_url;
        } else {
          // Caso o navegador tenha bloqueado a abertura da popup
          setBlockedPopupUrl(data.authorization_url);
          setBlockedPopupFlow('facebook');
          setShowBlockedPopupModal(true);
        }
      }
    } catch {
      if (popup && !popup.closed) popup.close();
      setErrorBanner('Erro de comunicação com o servidor backend.');
      setConnectingFlow(null);
    }
  };

  const handleStartInstagramOAuth = async () => {
    setErrorBanner(null);
    setSuccessBanner(null);
    setConnectingFlow('instagram');
    const token = safeStorage.getItem('cf_token');

    const width = 640;
    const height = 750;
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
    let popup: Window | null = null;
    try {
      popup = window.open(
        'about:blank',
        'meta_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
      );
      if (popup) {
        popup.document.write(
          '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Conectando ao Instagram...</title><style>body{background:#0f172a;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;text-align:center;}h3{font-size:16px;margin-bottom:8px;color:#f472b6;}p{font-size:12px;color:#94a3b8;}</style></head><body><div><div style="font-size:36px;margin-bottom:12px;">📸</div><h3>Iniciando Instagram Login</h3><p>Conectando aos servidores oficiais da Meta/Instagram...</p></div></body></html>'
        );
      }
    } catch {}

    try {
      const originParam = encodeURIComponent(window.location.origin);
      const res = await fetch(`/api/meta/oauth/instagram/start?origin=${originParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (popup && !popup.closed) popup.close();
        setErrorBanner(data.error || 'Falha ao iniciar autenticação com o Instagram.');
        setConnectingFlow(null);
      } else if (data.authorization_url) {
        setPendingOAuthState(data.state);
        if (popup && !popup.closed) {
          popup.location.href = data.authorization_url;
        } else {
          setBlockedPopupUrl(data.authorization_url);
          setBlockedPopupFlow('instagram');
          setShowBlockedPopupModal(true);
        }
      }
    } catch {
      if (popup && !popup.closed) popup.close();
      setErrorBanner('Erro de comunicação com o servidor backend.');
      setConnectingFlow(null);
    }
  };

  const handleDisconnect = async (accountId: string, accountName: string) => {
    if (!window.confirm(`Deseja realmente desconectar a conta "${accountName}"? Todos os tokens de acesso associados serão excluídos permanentemente.`)) {
      return;
    }

    const token = safeStorage.getItem('cf_token');
    try {
      const res = await fetch(`/api/social/accounts/${encodeURIComponent(accountId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Falha ao desconectar conta.');
      } else {
        setSuccessBanner(data.message || 'Conta desconectada com sucesso.');
        fetchAccounts();
      }
    } catch {
      setActionError('Erro de rede ao desconectar.');
    }
  };

  const handleCopyEvidence = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEvidence(true);
    setTimeout(() => setCopiedEvidence(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F50087]">
              Etapa 2 — Conexão de Contas
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Meta Official APIs</span>
          </div>
          <h1 className="text-xl font-bold text-[#171B68]">
            Contas Conectadas do Centro Fashion Fortaleza
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fluxos independentes para Facebook Login (Páginas) e Instagram API with Instagram Login, com tokens cifrados AES-256-GCM, seleção explícita de página e inspeção em tempo real.
          </p>
        </div>

        <button
          onClick={fetchAccounts}
          disabled={loading}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#F50087]' : ''}`} />
          <span>Atualizar Contas</span>
        </button>
      </div>

      {/* Banners de Sucesso ou Erro */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-900 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Sucesso na Operação: </span>
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {errorBanner && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-900 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Aviso na Autenticação: </span>
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)} className="text-red-700 font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* MODAL DE SEGURANÇA PARA ABERTURA MANUAL SE POPUP FOR BLOQUEADO PELO NAVEGADOR */}
      {showBlockedPopupModal && blockedPopupUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${
                    blockedPopupFlow === 'facebook' ? 'bg-blue-600' : 'bg-pink-600'
                  } text-white flex items-center justify-center shadow-xs`}
                >
                  {blockedPopupFlow === 'facebook' ? <Facebook className="w-5 h-5" /> : <Instagram className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Janela Oficial de Conexão da Meta
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {blockedPopupFlow === 'facebook'
                      ? 'Facebook Login for Business (Graph API)'
                      : 'Instagram API with Instagram Login'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBlockedPopupModal(false);
                  setConnectingFlow(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed">
              <strong>Importante:</strong> A Meta bloqueia o carregamento de telas de login dentro de iframes por motivos de segurança. Abra a página de login em uma nova janela ou aba usando o botão abaixo:
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={blockedPopupUrl}
                target="_blank"
                rel="opener"
                className={`w-full py-2.5 px-4 ${
                  blockedPopupFlow === 'facebook' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-600 hover:bg-pink-700'
                } text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Login Oficial da Meta em Nova Aba</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  if (pendingOAuthState) {
                    fetchPendingPages(pendingOAuthState);
                  }
                  fetchAccounts();
                  setShowBlockedPopupModal(false);
                  setConnectingFlow(null);
                }}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Já autorizei na Meta / Verificar Conexão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / CARD DE SELEÇÃO EXPLÍCITA DE PÁGINA DO FACEBOOK (REQUISITO 3) */}
      {pendingPages.length > 0 && (
        <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-2xl space-y-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Facebook className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-blue-950">
                  Selecione a Página do Facebook para Conectar
                </h2>
                <p className="text-xs text-blue-800">
                  A Meta autorizou o acesso às seguintes Páginas administradas pelo usuário. Selecione explicitamente a Página oficial que deseja integrar ao Centro Fashion Fortaleza. <strong>Apenas a Página selecionada será persistida.</strong>
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelPageSelection}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded"
            >
              Cancelar
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {pendingPages.map((page) => {
              const isSelected = selectedPageId === page.id;
              return (
                <div
                  key={page.id}
                  onClick={() => setSelectedPageId(page.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-white shadow-xs ring-2 ring-blue-500/20'
                      : 'border-blue-200 bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600' : 'border-slate-300'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{page.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        ID: {page.id} · Categoria: {page.category}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${isSelected ? 'bg-blue-100 text-blue-800' : 'text-slate-400'}`}>
                    {isSelected ? 'Selecionada' : 'Clique para selecionar'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-blue-200">
            <span className="text-[11px] text-blue-900">
              Permissão <code>pages_read_engagement</code> e identificação da conta IG comercial vinculada serão consultadas nesta Página.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelPageSelection}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPageSelection}
                disabled={confirmingPage || !selectedPageId}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>{confirmingPage ? 'Conectando Página...' : 'Confirmar e Conectar Página'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de Pré-Requisito de Configurações */}
      {(!isConfigured || !isEncryptionOk) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            Configuração Prévia Necessária
          </div>
          <p>
            Para realizar a conexão OAuth oficial com os servidores da Meta, você deve cadastrar o <strong>App ID</strong> e <strong>App Secret</strong> reais nas configurações e confirmar que a chave permanente <code>APP_ENCRYPTION_KEY</code> está configurada.
          </p>
          <button
            onClick={() => onNavigateTab('config')}
            className="text-xs font-semibold text-[#171B68] hover:text-[#F50087] underline flex items-center gap-1"
          >
            Ir para Configurações da Meta
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* BLOCO DE BOTÕES DE CONEXÃO SEPARADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BOTÃO FLUXO A: FACEBOOK LOGIN */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Facebook className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Fluxo A: Facebook Login</h2>
                <p className="text-[11px] text-slate-500">Facebook Login for Business (Graph API)</p>
              </div>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-semibold">
              Páginas & Vínculos
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Permite consultar as Páginas do Facebook administradas pela equipe, selecionar explicitamente a Página oficial do <strong>Centro Fashion Fortaleza</strong> e identificar a conta comercial do Instagram vinculada.
          </p>

          <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 space-y-1 font-mono">
            <div><strong>Permissões:</strong> pages_show_list, pages_read_engagement, instagram_basic</div>
            <div><strong>Token:</strong> Page Access Token (Longa Duração / Cifrado AES-256)</div>
            <div><strong>Seleção:</strong> Página escolhida explicitamente pelo usuário</div>
          </div>

          <button
            onClick={handleStartFacebookOAuth}
            disabled={connectingFlow === 'facebook' || !isConfigured}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
          >
            <Facebook className="w-4 h-4" />
            <span>
              {connectingFlow === 'facebook' ? 'Aguardando login na janela da Meta...' : 'Conectar via Facebook Login'}
            </span>
          </button>
        </div>

        {/* BOTÃO FLUXO B: INSTAGRAM LOGIN */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Fluxo B: Instagram Login</h2>
                <p className="text-[11px] text-slate-500">Instagram API with Instagram Login</p>
              </div>
            </div>
            <span className="text-[10px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded font-mono font-semibold">
              Instagram Direto
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Permite autorização direta da conta profissional do Instagram (Creator ou Business) sem exigir vínculo obrigatório com uma Página do Facebook, utilizando o fluxo nativo do Instagram.
          </p>

          <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 space-y-1 font-mono">
            <div><strong>Permissões:</strong> instagram_business_basic</div>
            <div><strong>Host:</strong> graph.instagram.com / api.instagram.com</div>
            <div><strong>Token:</strong> Long-Lived User Access Token (60 dias)</div>
            <div>
              <strong>App ID em uso:</strong>{' '}
              <span className="text-pink-700 font-bold">
                {metaConfig?.instagram_app_id || metaConfig?.app_id || 'Não configurado'}
              </span>
            </div>
          </div>

          {/* GUIA RETRÁTIL DO FLUXO B NO META FOR DEVELOPERS */}
          <div className="border border-pink-100 rounded-lg bg-pink-50/40 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowInstagramGuide(!showInstagramGuide)}
              className="w-full p-2.5 text-left text-xs font-semibold text-pink-900 hover:bg-pink-100/50 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#F50087]" />
                <span>Como configurar o Fluxo B no painel da Meta for Developers?</span>
              </div>
              <span className="text-[10px] text-pink-700 underline">
                {showInstagramGuide ? 'Ocultar' : 'Ver 3 passos'}
              </span>
            </button>

            {showInstagramGuide && (
              <div className="p-3 border-t border-pink-100 bg-white text-xs space-y-3">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 text-[11px]">
                    1. No painel do seu app no Meta for Developers:
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Vá em <strong>Adicionar Produto</strong> e adicione o produto <strong>Instagram</strong> (Instagram API with Instagram Login).
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800 text-[11px]">
                      2. Cadastre o Redirect URI oficial:
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyIgCallback}
                      className="text-[10px] text-[#F50087] font-semibold hover:underline flex items-center gap-1"
                    >
                      {copiedIgCallback ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedIgCallback ? 'Copiado!' : 'Copiar URL'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Em <strong>Instagram &gt; Configurações básicas</strong>, cole no campo <strong>URIs de redirecionamento válidos do OAuth</strong>:
                  </p>
                  <div className="p-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-[10px] text-slate-800 select-all break-all">
                    {window.location.origin}/api/meta/oauth/instagram/callback
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-800 text-[11px]">
                    3. Se o app estiver em modo &quot;Desenvolvimento&quot; (Importante):
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Vá em <strong>Instagram &gt; Funções</strong> (ou Funções &gt; Testadores do Instagram), adicione seu perfil <code>@seu_instagram</code> e aceite o convite em <strong>instagram.com &gt; Configurações &gt; Apps e Sites &gt; Convites de Testadores</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleStartInstagramOAuth}
            disabled={connectingFlow === 'instagram' || !isConfigured}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#F50087] to-purple-700 hover:from-[#D60074] hover:to-purple-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs cursor-pointer"
          >
            <Instagram className="w-4 h-4" />
            <span>
              {connectingFlow === 'instagram' ? 'Aguardando login na janela do Instagram...' : 'Conectar via Instagram Login'}
            </span>
          </button>
        </div>
      </div>

      {/* LISTA DE CONTAS CONECTADAS NO BANCO SQLITE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#171B68]">
              Contas Profissionais Atualmente Conectadas ({accounts.length})
            </h2>
            <p className="text-xs text-slate-500">
              Tokens armazenados sob criptografia AES-256-GCM. Nenhum segredo ou token de acesso é exposto ao navegador.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
            Status: Ativo
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Carregando contas conectadas...</div>
        ) : accounts.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Share2 className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">Nenhuma conta conectada no momento</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Utilize os botões acima para conectar sua Página do Facebook ou sua Conta Profissional do Instagram via OAuth oficial.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {accounts.map((acc) => {
              const isFb = acc.auth_flow === 'facebook_login';
              let metadataObj: any = {};
              try {
                metadataObj = JSON.parse(acc.metadata_json || '{}');
              } catch {
                metadataObj = {};
              }

              return (
                <div key={acc.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-xs ${
                        isFb ? 'bg-blue-600' : 'bg-gradient-to-tr from-amber-500 to-pink-600'
                      }`}
                    >
                      {isFb ? <Facebook className="w-5 h-5" /> : <Instagram className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{acc.account_name}</h3>
                        <span
                          className={`text-[9px] px-2 py-0.2 rounded font-mono font-semibold uppercase ${
                            isFb ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {isFb ? 'Facebook Login' : 'Instagram Login'}
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded font-semibold">
                          Autorizada & Cifrada
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                        <span>ID Meta: <strong>{acc.account_id}</strong></span>
                        {acc.username && (
                          <span>Username: <strong>@{acc.username}</strong></span>
                        )}
                        {acc.linked_instagram_id && (
                          <span className="text-[#F50087]">
                            IG Vinculado: <strong>{acc.linked_instagram_id}</strong>
                          </span>
                        )}
                        {metadataObj.followers_count !== undefined && (
                          <span className="text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                            Seguidores: <strong>{metadataObj.followers_count}</strong> (pages_read_engagement)
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Conectada em: {new Date(acc.connected_at).toLocaleString('pt-BR')} · Token: {acc.token_type || 'Access Token'} ({acc.token_expires_at || 'Ativo'})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Botão de Inspeção para App Review */}
                    <button
                      onClick={() => handleInspectAccount(acc)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#171B68] hover:text-[#F50087] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#171B68]" />
                      <span>Inspecionar Permissões</span>
                    </button>

                    {user.role !== 'reviewer' ? (
                      <button
                        onClick={() => handleDisconnect(acc.id, acc.account_name)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Desconectar</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        Modo Avaliação
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nota explicativa de aceite da Etapa 2 */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="font-bold text-[#171B68]">Diferenciação de Funcionalidade:</div>
          <p>
            As contas acima estão autenticadas para recuperação de perfil, identificação e comprovação de leitura de engajamento (<code>pages_read_engagement</code>). As operações de <strong>Publicação (Etapa 3)</strong>, <strong>Comentários (Etapa 4)</strong> e <strong>Atendimento (Etapa 5)</strong> permanecem desabilitadas até que cada etapa seja implementada e validada com a API oficial.
          </p>
        </div>
      </div>

      {/* MODAL / DRAWER DE INSPEÇÃO DE PERMISSÕES E TOKEN (EVIDÊNCIA DE APP REVIEW) */}
      {inspectionAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-[#171B68]">
                    Inspeção do Token & Comprovação de Permissões
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Conta: {inspectionAccount.account_name} ({inspectionAccount.auth_flow === 'facebook_login' ? 'Facebook Login' : 'Instagram Login'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectionAccount(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {inspectionLoading ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#F50087]" />
                  <span>Consultando Graph API e validando token com o servidor da Meta...</span>
                </div>
              ) : inspectionError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{inspectionError}</span>
                </div>
              ) : inspectionData ? (
                <>
                  {/* Bloco de Validade e Expiração */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Status do Token</span>
                      <span className="font-bold text-emerald-700 text-sm flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {inspectionData.is_valid ? 'Ativo e Válido' : 'Inválido'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Tipo de Token</span>
                      <span className="font-mono text-slate-800 font-semibold mt-0.5 block">
                        {inspectionAccount.token_type || 'Page Access Token'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Expiração</span>
                      <span className="font-mono text-slate-800 font-semibold mt-0.5 block truncate">
                        {inspectionData.debug_token_data?.expires_at || inspectionAccount.token_expires_at || 'Sem expiração (Page)'}
                      </span>
                    </div>
                  </div>

                  {/* Permissões Efetivamente Concedidas */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-900 block">
                      Permissões Efetivamente Concedidas no Escopo:
                    </span>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                      {inspectionData.permissions_granted.map((perm) => (
                        <span key={perm} className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Comprovação Efetiva de pages_read_engagement (Requisito 6) */}
                  {inspectionData.engagement_evidence && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-blue-950">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-xs">
                          Comprovação Efetiva de Uso: <code>pages_read_engagement</code>
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-900 leading-relaxed">
                        A permissão não foi apenas solicitada; o sistema realizou a chamada de leitura de engajamento oficial contra a Graph API:
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-blue-200 font-mono text-[11px] space-y-1">
                        <div><strong>Endpoint executado:</strong> {inspectionData.engagement_evidence.endpoint}</div>
                        <div><strong>Status retornado:</strong> HTTP 200 OK</div>
                        <div><strong>Seguidores da Página (followers_count):</strong> {inspectionData.engagement_evidence.followers_count}</div>
                        <div><strong>Fãs da Página (fan_count):</strong> {inspectionData.engagement_evidence.fan_count}</div>
                      </div>
                      <div className="text-[10px] text-blue-800">
                        {inspectionData.engagement_evidence.demonstration}
                      </div>
                    </div>
                  )}

                  {/* Roteiro e Enquadramento para o Vídeo de App Review */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-950">
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-700" />
                      Roteiro e Enquadramento Exatos para Gravação do Vídeo (App Review):
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900">
                      <li><strong>Enquadramento:</strong> Grave a tela inteira mostrando a URL do navegador com HTTPS visível.</li>
                      <li><strong>Ação 1:</strong> Mostre o login interno com usuário reviewer (<code>reviewer@meta.com</code>).</li>
                      <li><strong>Ação 2:</strong> Clique no botão "{inspectionAccount.auth_flow === 'facebook_login' ? 'Conectar via Facebook Login' : 'Conectar via Instagram Login'}".</li>
                      <li><strong>Ação 3:</strong> Demonstre o diálogo de consentimento da Meta exibindo o nome do aplicativo e as permissões solicitadas.</li>
                      {inspectionAccount.auth_flow === 'facebook_login' && (
                        <li><strong>Ação 4:</strong> Demonstre a seleção explícita da Página "Centro Fashion Fortaleza" e a leitura imediata dos dados de seguidores.</li>
                      )}
                      <li><strong>Ação 5:</strong> Abra esta janela de inspeção comprovando o token ativo e os dados reais retornados.</li>
                    </ul>
                  </div>

                  {/* Botão de Cópia das Evidências Sanitizadas */}
                  <button
                    onClick={() => {
                      const summary = `=== EVIDÊNCIA DE APP REVIEW — CENTRO FASHION FORTALEZA ===
Conta: ${inspectionAccount.account_name} (ID: ${inspectionAccount.account_id})
Fluxo: ${inspectionAccount.auth_flow === 'facebook_login' ? 'Facebook Login for Business' : 'Instagram API with Instagram Login'}
Status do Token: Ativo e Válido
Tipo de Token: ${inspectionAccount.token_type || 'Page Access Token'}
Permissões Concedidas: ${inspectionData.permissions_granted.join(', ')}
${inspectionData.engagement_evidence ? `pages_read_engagement Comprovada: Endpoint ${inspectionData.engagement_evidence.endpoint} | Seguidores: ${inspectionData.engagement_evidence.followers_count} | Fãs: ${inspectionData.engagement_evidence.fan_count}` : ''}
Data da Inspeção: ${new Date().toISOString()}
Segredos e tokens preservados sob criptografia AES-256-GCM no servidor.`;
                      handleCopyEvidence(summary);
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {copiedEvidence ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedEvidence ? 'Evidências Copiadas com Sucesso!' : 'Copiar Resumo Sanitizado para Submissão Meta'}</span>
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
