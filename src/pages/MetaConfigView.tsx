import React, { useState, useEffect } from 'react';
import { MetaConfig, EnvironmentUrls, User } from '../types.js';
import {
  Lock,
  Copy,
  Check,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Save,
  Globe,
  ExternalLink,
  ShieldAlert,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { safeStorage } from '../utils/storage.js';

interface Props {
  user: User;
  metaConfig: MetaConfig | null;
  envUrls: EnvironmentUrls | null;
  onRefreshConfig: (updated?: MetaConfig) => void;
}

export const MetaConfigView: React.FC<Props> = ({
  user,
  metaConfig,
  envUrls,
  onRefreshConfig,
}) => {
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [instagramAppId, setInstagramAppId] = useState('');
  const [instagramAppSecret, setInstagramAppSecret] = useState('');
  const [apiVersion, setApiVersion] = useState('v22.0');
  const [webhookToken, setWebhookToken] = useState('cf_verify_token_2026_webhook');
  
  const [showAppSecret, setShowAppSecret] = useState(false);
  const [showInstagramAppSecret, setShowInstagramAppSecret] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Estado do Diagnóstico do Webhook
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookDiagnostic, setWebhookDiagnostic] = useState<{
    get_handshake?: { status: string; details: string; challenge_sent: string; response_received: string };
    post_reception?: { status: string; details: string; signature_tested: boolean; response_received: string };
    summary?: string;
  } | null>(null);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);

  const isEncryptionOk = metaConfig?.encryption_status?.configured;

  useEffect(() => {
    if (metaConfig) {
      if (metaConfig.app_id) setAppId(metaConfig.app_id);
      if (metaConfig.instagram_app_id) setInstagramAppId(metaConfig.instagram_app_id);
      if (metaConfig.api_version) setApiVersion(metaConfig.api_version);
      if (metaConfig.webhook_verify_token) setWebhookToken(metaConfig.webhook_verify_token);
    }
  }, [metaConfig]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setWebhookDiagnostic(null);
    setDiagnosticError(null);
    const token = safeStorage.getItem('cf_token');

    try {
      const res = await fetch('/api/meta/webhook/test-ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setDiagnosticError(data.error || 'Falha ao executar diagnóstico do webhook.');
      } else {
        setWebhookDiagnostic(data);
      }
    } catch {
      setDiagnosticError('Erro de comunicação com o backend durante teste do webhook.');
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanAppId = appId.trim();
    if (!cleanAppId) {
      setErrorMsg('Por favor, informe o Meta App ID (Principal / Facebook) antes de salvar.');
      return;
    }

    setSaving(true);
    const token = safeStorage.getItem('cf_token');

    try {
      const res = await fetch('/api/meta/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          app_id: cleanAppId,
          app_secret: appSecret.trim(),
          instagram_app_id: instagramAppId.trim(),
          instagram_app_secret: instagramAppSecret.trim(),
          api_version: apiVersion.trim(),
          webhook_verify_token: webhookToken.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Falha ao salvar configurações.');
      } else {
        setSuccessMsg(
          data.message ||
            `✓ Meta App ID (${cleanAppId}) e chaves secretas gravadas e criptografadas com AES-256-GCM no SQLite com sucesso!`
        );
        setAppSecret(''); // Limpa o input de digitação temporária por segurança
        setInstagramAppSecret('');
        if (data.config) {
          onRefreshConfig(data.config);
        } else {
          onRefreshConfig();
        }
      }
    } catch {
      setErrorMsg('Falha de rede ao se comunicar com o backend.');
    } finally {
      setSaving(false);
    }
  };

  const hasStoredAppSecret = Boolean(metaConfig?.app_secret_masked);
  const hasStoredIgSecret = Boolean(metaConfig?.instagram_app_secret_masked);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Título e Descrição */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#171B68]">
            Configurações das Integrações Meta
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre o App ID e App Secret oficiais obtidos no Meta for Developers para habilitar a Etapa 2 (Conexão de Contas).
          </p>
        </div>

        {/* Indicador de Usuário Autenticado com Permissão */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Conectado como <strong>{user.name}</strong> ({user.role})
          </span>
        </div>
      </div>

      {/* Alerta de Criptografia Permanente */}
      {isEncryptionOk ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Armazenamento Seguro Ativo: </span>
              <span>Chave permanente AES-256-GCM ativa. Tokens e segredos são cifrados antes da persistência no SQLite.</span>
            </div>
          </div>
          <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-semibold shrink-0">
            AES-256-GCM OK
          </span>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            Aviso de Criptografia
          </div>
          <p>
            {metaConfig?.encryption_status?.message || 'Verificando chave de criptografia permanente no servidor.'}
          </p>
        </div>
      )}

      {/* Formulário de Credenciais com Separação Exata de Fluxos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#F50087]" />
            <h2 className="text-sm font-bold text-[#171B68]">Credenciais Separadas da Meta</h2>
          </div>
          {metaConfig?.configured ? (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Configuração Salva no Banco
            </span>
          ) : (
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-1 rounded font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Aguardando Credenciais
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* SEÇÃO 1: FLUXO A - FACEBOOK LOGIN FOR BUSINESS */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                  Fluxo A: Facebook Login for Business (Graph API)
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Páginas & Instagram Vinculado
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meta App ID (Principal / Facebook) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={saving}
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="Exemplo: 123456789012345"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 font-mono text-slate-900 bg-white shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Identificador numérico do aplicativo cadastrado no painel Meta for Developers.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Meta App Secret (Principal / Facebook) <span className="text-rose-500">*</span>
                  </label>
                  {hasStoredAppSecret && (
                    <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Salvo e Ativo: {metaConfig?.app_secret_masked}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showAppSecret ? 'text' : 'password'}
                    disabled={saving}
                    value={appSecret}
                    onChange={(e) => setAppSecret(e.target.value)}
                    placeholder={hasStoredAppSecret ? '•••••••••••••••• (Salvo — digite apenas para alterar)' : 'Cole o App Secret da Meta aqui'}
                    className={`w-full pl-3 pr-10 py-2 text-sm border rounded-lg focus:outline-hidden font-mono shadow-2xs ${
                      hasStoredAppSecret && !appSecret
                        ? 'border-emerald-300 bg-emerald-50/30 text-slate-700 focus:border-emerald-500'
                        : 'border-slate-300 bg-white text-slate-900 focus:border-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAppSecret(!showAppSecret)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    title={showAppSecret ? 'Ocultar segredo' : 'Mostrar segredo'}
                  >
                    {showAppSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] mt-1 block">
                  {hasStoredAppSecret ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Segredo gravado e protegido com AES-256-GCM. Deixe em branco para mantê-lo ativo.
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      Chave secreta obtida em Painel da Meta &gt; Configurações do App &gt; Básico.
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: FLUXO B - INSTAGRAM LOGIN (INSTAGRAM API) */}
          <div className="p-4 rounded-xl border border-pink-100 bg-pink-50/40 space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F50087]"></span>
                <h3 className="text-xs font-bold text-pink-950 uppercase tracking-wide">
                  Fluxo B: Instagram API with Instagram Login
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-pink-100 text-pink-800 px-2 py-0.5 rounded">
                Instagram Direto (Sem Página)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instagram App ID (Opcional / Específico)
                </label>
                <input
                  type="text"
                  disabled={saving}
                  value={instagramAppId}
                  onChange={(e) => setInstagramAppId(e.target.value)}
                  placeholder={appId ? `Herda Meta App ID (${appId}) se vazio` : 'Insira o Instagram App ID se for aplicativo separado'}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#F50087] font-mono text-slate-900 bg-white shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Caso o app utilize produto dedicado de Instagram Login com ID próprio. Se vazio, utiliza o Meta App ID acima.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Instagram App Secret (Opcional / Específico)
                  </label>
                  {hasStoredIgSecret && (
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                      Ativo: {metaConfig?.instagram_app_secret_masked}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showInstagramAppSecret ? 'text' : 'password'}
                    disabled={saving}
                    value={instagramAppSecret}
                    onChange={(e) => setInstagramAppSecret(e.target.value)}
                    placeholder={hasStoredIgSecret ? 'Digite apenas para substituir o segredo atual' : 'Herda Meta App Secret se vazio'}
                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#F50087] font-mono text-slate-900 bg-white shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowInstagramAppSecret(!showInstagramAppSecret)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    title={showInstagramAppSecret ? 'Ocultar segredo' : 'Mostrar segredo'}
                  >
                    {showInstagramAppSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {hasStoredIgSecret
                    ? 'Segredo do Instagram salvo no banco. Deixe em branco para manter.'
                    : 'Segredo específico do Instagram. Se vazio, o servidor utiliza o Meta App Secret principal.'}
                </span>
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: PARÂMETROS GERAIS DE API E WEBHOOK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Versão da Graph API (Configurável)
              </label>
              <select
                disabled={saving}
                value={apiVersion}
                onChange={(e) => setApiVersion(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#F50087] font-mono text-slate-900 bg-white shadow-2xs"
              >
                <option value="v22.0">v22.0 (Recomendada / Vigente Oficial)</option>
                <option value="v21.0">v21.0 (Compatibilidade)</option>
                <option value="v20.0">v20.0</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Sem versão fixada no código: todas as requisições utilizam o valor selecionado.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Webhook Verify Token (Token de Verificação)
              </label>
              <input
                type="text"
                disabled={saving}
                value={webhookToken}
                onChange={(e) => setWebhookToken(e.target.value)}
                placeholder="cf_verify_token_2026_webhook"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#F50087] font-mono text-slate-900 bg-white shadow-2xs"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Token para validação do handshake GET oficial da Meta (hub.verify_token).
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#F50087] hover:bg-[#D60074] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Criptografando e Salvando no SQLite...' : 'Salvar Credenciais no SQLite'}
            </button>
          </div>
        </form>
      </div>

      {/* DIAGNÓSTICO E COMPROVAÇÃO DO WEBHOOK OFICIAL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#171B68]" />
            <div>
              <h2 className="text-sm font-bold text-[#171B68]">Diagnóstico e Comprovação do Webhook Oficial</h2>
              <p className="text-[11px] text-slate-500">
                Validação separada do Handshake GET de verificação e da Recepção de Eventos POST com assinatura HMAC-SHA256
              </p>
            </div>
          </div>
          <button
            onClick={handleTestWebhook}
            disabled={testingWebhook}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#171B68] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Shield className={`w-3.5 h-3.5 ${testingWebhook ? 'animate-spin text-[#F50087]' : ''}`} />
            <span>{testingWebhook ? 'Testando Webhook...' : 'Executar Diagnóstico do Webhook'}</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Status do Handshake GET */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">1. Verificação do Endpoint (GET Handshake)</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                  Implementado
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Responde a <code>GET /api/meta/webhook?hub.mode=subscribe&hub.verify_token=...</code> e devolve o <code>hub.challenge</code> exato com código HTTP 200.
              </p>
              {webhookDiagnostic?.get_handshake && (
                <div className="p-2.5 bg-white rounded border border-emerald-200 text-[11px] text-emerald-900 font-mono space-y-1">
                  <div>Status: <strong>{webhookDiagnostic.get_handshake.status}</strong></div>
                  <div>Challenge enviado: {webhookDiagnostic.get_handshake.challenge_sent}</div>
                  <div>Resposta do endpoint: {webhookDiagnostic.get_handshake.response_received}</div>
                </div>
              )}
            </div>

            {/* 2. Status da Recepção POST Assinada */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">2. Recepção de Eventos (POST com HMAC-SHA256)</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                  Implementado
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Recebe eventos da Meta em <code>POST /api/meta/webhook</code> e valida o cabeçalho <code>X-Hub-Signature-256</code> contra o App Secret descriptografado.
              </p>
              {webhookDiagnostic?.post_reception && (
                <div className="p-2.5 bg-white rounded border border-emerald-200 text-[11px] text-emerald-900 font-mono space-y-1">
                  <div>Status: <strong>{webhookDiagnostic.post_reception.status}</strong></div>
                  <div>Assinatura testada: {webhookDiagnostic.post_reception.signature_tested ? 'HMAC-SHA256 Válida' : 'Não'}</div>
                  <div>Resposta do endpoint: {webhookDiagnostic.post_reception.response_received}</div>
                </div>
              )}
            </div>
          </div>

          {diagnosticError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{diagnosticError}</span>
            </div>
          )}

          {webhookDiagnostic?.summary && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Comprovação de Operação: </strong>{webhookDiagnostic.summary}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bloco de URLs Públicas para o Meta Developers Console */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#171B68]" />
            <h2 className="text-sm font-bold text-[#171B68]">
              URLs Públicas para Configuração no Meta for Developers
            </h2>
          </div>
          <span className="text-[10px] text-slate-500">
            Prontas para colar no painel da Meta
          </span>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Copie as URLs abaixo e insira nos respectivos campos nas abas de configuração do seu aplicativo no Meta for Developers:
          </p>

          <div className="space-y-3">
            {/* 1. Facebook Login OAuth Redirect */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>1. Facebook Login — URIs de redirecionamento do OAuth válidos</span>
                <button
                  onClick={() => envUrls && handleCopy(envUrls.facebook_oauth_redirect, 'fb_oauth')}
                  className="text-xs text-[#F50087] hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'fb_oauth' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'fb_oauth' ? 'Copiado!' : 'Copiar URL'}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200 break-all select-all">
                {envUrls?.facebook_oauth_redirect || 'Carregando...'}
              </div>
            </div>

            {/* 2. Instagram Login OAuth Redirect */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>2. Instagram API with Instagram Login — Redirect URI Oficial</span>
                <button
                  onClick={() => envUrls && handleCopy(envUrls.instagram_oauth_redirect, 'ig_oauth')}
                  className="text-xs text-[#F50087] hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'ig_oauth' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'ig_oauth' ? 'Copiado!' : 'Copiar URL'}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200 break-all select-all">
                {envUrls?.instagram_oauth_redirect || 'Carregando...'}
              </div>
            </div>

            {/* 3. Webhook Callback URL */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>3. Webhooks — URL de Retorno de Chamada (Callback URL)</span>
                <button
                  onClick={() => envUrls && handleCopy(envUrls.webhook_callback_url, 'webhook')}
                  className="text-xs text-[#F50087] hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'webhook' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'webhook' ? 'Copiado!' : 'Copiar URL'}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200 break-all select-all">
                {envUrls?.webhook_callback_url || 'Carregando...'}
              </div>
            </div>

            {/* 4. Data Deletion Callback URL */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>4. Exclusão de Dados — URL de Retorno de Chamada (Data Deletion Callback)</span>
                <button
                  onClick={() => envUrls && handleCopy(envUrls.data_deletion_callback_url, 'data_del')}
                  className="text-xs text-[#F50087] hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'data_del' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'data_del' ? 'Copiado!' : 'Copiar URL'}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200 break-all select-all">
                {envUrls?.data_deletion_callback_url || 'Carregando...'}
              </div>
            </div>

            {/* 4.1 Deauthorize Callback URL */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>4.1 Desautorização — URL de Retorno de Chamada (Deauthorize Callback)</span>
                <button
                  onClick={() => envUrls?.deauth_callback_url && handleCopy(envUrls.deauth_callback_url, 'deauth')}
                  className="text-xs text-[#F50087] hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'deauth' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'deauth' ? 'Copiado!' : 'Copiar URL'}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200 break-all select-all">
                {envUrls?.deauth_callback_url || (envUrls?.base_url ? `${envUrls.base_url}/api/meta/deauth` : 'Carregando...')}
              </div>
            </div>

            {/* 5. Data Deletion User Instructions URL */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>5. Exclusão de Dados — URL de Instruções do Usuário (Data Deletion URL)</span>
                <button
                  onClick={() => envUrls && handleCopy(envUrls.data_deletion_instructions_url, 'del_inst')}
                  className="text-xs text-[#F50087] hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'del_inst' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'del_inst' ? 'Copiado!' : 'Copiar URL'}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200 break-all select-all">
                {envUrls?.data_deletion_instructions_url || 'Carregando...'}
              </div>
            </div>

            {/* 6 e 7. Privacidade e Termos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>6. URL da Política de Privacidade</span>
                  <button
                    onClick={() => envUrls && handleCopy(envUrls.privacy_policy_url, 'priv')}
                    className="text-xs text-[#F50087] hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'priv' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'priv' ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200 break-all select-all">
                  {envUrls?.privacy_policy_url || 'Carregando...'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>7. URL dos Termos de Serviço</span>
                  <button
                    onClick={() => envUrls && handleCopy(envUrls.terms_of_service_url, 'terms')}
                    className="text-xs text-[#F50087] hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'terms' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'terms' ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200 break-all select-all">
                  {envUrls?.terms_of_service_url || 'Carregando...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
