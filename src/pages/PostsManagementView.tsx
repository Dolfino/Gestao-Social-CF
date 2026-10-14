import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types.js';
import {
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  RefreshCw,
  Send,
  Eye,
  Info,
  Layers,
  ArrowRight,
  Hash,
  Copy,
  Check,
  Camera,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Lock,
} from 'lucide-react';
import { safeStorage } from '../utils/storage.js';

interface Props {
  user: User;
  onNavigateTab: (tab: string) => void;
}

interface FlowStatus {
  account_id: string | null;
  account_name: string;
  page_id?: string | null;
  linked_instagram_id?: string | null;
  linked_instagram_username?: string | null;
  username?: string | null;
  is_connected: boolean;
  permissions_granted: string[];
  has_publish_permission: boolean;
  required_permission: string;
  flow_name: string;
  endpoint: string;
}

interface PostsStatusResponse {
  facebook_login_flow: FlowStatus;
  instagram_login_flow: FlowStatus;
}

interface MediaSample {
  id: string;
  title: string;
  filename: string;
  url: string;
  dimensions: string;
  aspectRatio: string;
  format: string;
  defaultCaption: string;
}

interface PublicationRecord {
  id: string;
  channel: string;
  flow: string;
  account_id: string;
  account_name: string;
  media_url: string;
  caption: string;
  container_id: string;
  meta_media_id: string;
  permalink: string;
  status: string;
  error_details: string;
  created_by_user_name: string;
  created_at: string;
  published_at: string;
}

export const PostsManagementView: React.FC<Props> = ({ user, onNavigateTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'history'>('create');
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [flowsStatus, setFlowsStatus] = useState<PostsStatusResponse | null>(null);
  const [samples, setSamples] = useState<MediaSample[]>([]);
  const [history, setHistory] = useState<PublicationRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // Formulário de Criação de Post
  const [selectedFlow, setSelectedFlow] = useState<'facebook_login' | 'instagram_login'>('instagram_login');
  const [mediaSource, setMediaSource] = useState<'upload' | 'sample'>('sample');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('sample_01');
  const [caption, setCaption] = useState<string>('');
  const [uploadedMedia, setUploadedMedia] = useState<{
    url: string;
    width: number;
    height: number;
    aspect_ratio: number;
    format: string;
    size_bytes: number;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Modal de Confirmação Explícita
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishingStep, setPublishingStep] = useState<string>('');
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    permalink?: string;
    meta_media_id?: string;
    error?: string;
    isPermissionMissing?: boolean;
    missingPermission?: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hashtagsSugeridas = [
    '#CentroFashionFortaleza',
    '#ModaAtacado',
    '#FeiraDaMadrugada',
    '#AtacadoFortaleza',
    '#ModaFeminina',
    '#JeansAtacado',
    '#Beachwear2026',
    '#ModaNordeste',
  ];

  // Carrega status das permissões e amostras
  const loadPostsStatus = async () => {
    setLoadingStatus(true);
    const token = safeStorage.getItem('cf_token');
    try {
      const [resStatus, resSamples] = await Promise.all([
        fetch('/api/meta/posts/status', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/meta/media/samples', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (resStatus.ok) {
        const dataStatus = await resStatus.json();
        setFlowsStatus(dataStatus);
      }
      if (resSamples.ok) {
        const dataSamples = await resSamples.json();
        setSamples(dataSamples.samples || []);
        if (dataSamples.samples?.length > 0 && !caption) {
          setCaption(dataSamples.samples[0].defaultCaption);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar status de posts:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    const token = safeStorage.getItem('cf_token');
    try {
      const res = await fetch('/api/meta/posts/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.posts || []);
      }
    } catch (e) {
      console.error('Erro ao buscar histórico:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadPostsStatus();
    loadHistory();
  }, []);

  // Atualiza legenda padrão ao trocar de amostra
  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setUploadError(null);
    const sample = samples.find((s) => s.id === sampleId);
    if (sample) {
      setCaption(sample.defaultCaption);
    }
  };

  // Converte no navegador para JPEG de alta fidelidade garantindo que qualquer formato (PNG, WebP, etc.) se torne JPEG oficial
  const convertFileToJpegBase64 = (inputFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(reader.result as string);
          }
          // Preenche com fundo branco puro para evitar transparência preta
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = () => resolve(reader.result as string);
        img.src = reader.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(inputFile);
    });
  };

  // Upload de arquivo pelo computador
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    const token = safeStorage.getItem('cf_token');

    try {
      // Converte antecipadamente para JPEG no navegador
      const dataUrl = await convertFileToJpegBase64(file);
      if (!dataUrl) {
        throw new Error('Falha ao ler os dados da imagem.');
      }

      const res = await fetch('/api/meta/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dataUrl,
          filename: file.name.replace(/\.[^.]+$/, '.jpg'),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.details?.[0] || data.error || 'Falha na validação técnica da imagem.');
      } else {
        setUploadedMedia({
          url: data.public_url,
          width: data.width,
          height: data.height,
          aspect_ratio: data.aspect_ratio,
          format: data.format,
          size_bytes: data.size_bytes,
        });
        setMediaSource('upload');
      }
    } catch (err) {
      setUploadError('Erro ao processar imagem: ' + String(err));
    } finally {
      setIsUploading(false);
    }
  };

  // Reautorização com permissões de publicação
  const handleReauth = async (flow: 'facebook_login' | 'instagram_login') => {
    const token = safeStorage.getItem('cf_token');
    const endpoint =
      flow === 'facebook_login'
        ? `/api/meta/oauth/facebook/start?include_publish=1&origin=${encodeURIComponent(window.location.origin)}`
        : `/api/meta/oauth/instagram/start?include_publish=1&origin=${encodeURIComponent(window.location.origin)}`;

    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.authorization_url) {
        const width = 600;
        const height = 750;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        window.open(
          data.authorization_url,
          'MetaReauth',
          `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0`
        );
      } else {
        alert(data.error || 'Falha ao iniciar reautorização.');
      }
    } catch {
      alert('Erro de conexão ao solicitar autorização.');
    }
  };

  // Pega a URL da mídia ativa
  const currentSample = samples.find((s) => s.id === selectedSampleId);
  const activeMediaUrl = mediaSource === 'upload' && uploadedMedia ? uploadedMedia.url : currentSample?.url || '';

  // Preparação e abertura do Modal de Confirmação Explícita
  const handleOpenConfirm = () => {
    if (!activeMediaUrl) {
      alert('Por favor, selecione ou faça o upload de uma foto válida antes de continuar.');
      return;
    }

    // Gera chave única de idempotência vinculada à tentativa
    const newIdempotency = `cf_post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setIdempotencyKey(newIdempotency);
    setPublishResult(null);
    setIsConfirmModalOpen(true);
  };

  // Execução do Disparo Real na Meta Graph API com prevenção de duplicação
  const handleExecutePublish = async () => {
    if (isPublishing) return; // Prevenção de clique repetido

    setIsPublishing(true);
    setPublishResult(null);
    setPublishingStep('1/3: Criando contêiner de mídia na Meta...');

    const token = safeStorage.getItem('cf_token');

    const keyToSend = publishResult && !publishResult.success
      ? `cf_post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      : idempotencyKey || `cf_post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setIdempotencyKey(keyToSend);

    try {
      // 1. Criação do Contêiner
      const containerRes = await fetch('/api/meta/posts/create-container', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          flow: selectedFlow,
          media_url: activeMediaUrl,
          caption,
          idempotency_key: keyToSend,
        }),
      });

      let containerData: any = null;
      try {
        const text = await containerRes.text();
        containerData = JSON.parse(text);
      } catch {
        setPublishResult({
          success: false,
          error: `Erro no servidor (${containerRes.status} ${containerRes.statusText || ''}). Não foi possível processar a resposta.`,
        });
        setIsPublishing(false);
        return;
      }

      if (!containerRes.ok || containerData.success === false) {
        const isPermMissing = containerData.error === 'PERMISSAO_PUBLICACAO_AUSENTE';
        setPublishResult({
          success: false,
          isPermissionMissing: isPermMissing,
          missingPermission: containerData.missing_permission,
          error:
            containerData.message ||
            containerData.error ||
            'A Meta recusou a criação do contêiner de mídia.',
        });
        setIsPublishing(false);
        return;
      }

      if (containerData.already_published) {
        setPublishResult({
          success: true,
          permalink: containerData.permalink,
          meta_media_id: containerData.meta_media_id,
        });
        setIsPublishing(false);
        loadHistory();
        return;
      }

      const containerId = containerData.container_id;
      setPublishingStep(`2/3: Contêiner ID ${containerId} gerado. Aguardando processamento da mídia...`);

      // Breve pausa para garantir processamento assíncrono do contêiner
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setPublishingStep('3/3: Publicando contêiner no feed oficial do Instagram...');

      // 2. Publicação do Contêiner
      const publishRes = await fetch('/api/meta/posts/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          container_id: containerId,
          flow: selectedFlow,
          idempotency_key: idempotencyKey,
        }),
      });

      let publishData: any = null;
      try {
        const pubText = await publishRes.text();
        publishData = JSON.parse(pubText);
      } catch {
        setPublishResult({
          success: false,
          error: `Erro na publicação (${publishRes.status} ${publishRes.statusText || ''}). Resposta inesperada do servidor.`,
        });
        setIsPublishing(false);
        return;
      }

      if (!publishRes.ok) {
        setPublishResult({
          success: false,
          error:
            publishData.message ||
            publishData.error ||
            'Falha no disparo do contêiner para publicação no feed.',
        });
      } else {
        setPublishResult({
          success: true,
          permalink: publishData.permalink,
          meta_media_id: publishData.meta_media_id,
        });
        loadHistory();
      }
    } catch (err) {
      setPublishResult({
        success: false,
        error: 'Erro de comunicação ao enviar requisição: ' + String(err),
      });
    } finally {
      setIsPublishing(false);
      setPublishingStep('');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentFlowConfig =
    selectedFlow === 'facebook_login'
      ? flowsStatus?.facebook_login_flow
      : flowsStatus?.instagram_login_flow;

  const targetAccountLabel =
    selectedFlow === 'facebook_login'
      ? flowsStatus?.facebook_login_flow?.linked_instagram_username
        ? `@${flowsStatus.facebook_login_flow.linked_instagram_username} (via Página Centro Fashion)`
        : 'Instagram Vinculado à Página'
      : flowsStatus?.instagram_login_flow?.account_name || '@centrofashionfor';

  const targetNumericId =
    selectedFlow === 'facebook_login'
      ? flowsStatus?.facebook_login_flow?.linked_instagram_id || 'ID Pendente'
      : flowsStatus?.instagram_login_flow?.account_id || 'ID Pendente';

  const hasPublishPermission = currentFlowConfig?.has_publish_permission ?? false;

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Cabeçalho da Etapa 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F50087]">
              Etapa 3
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Feed & Vitrines de Moda</span>
          </div>
          <h1 className="text-xl font-bold text-[#171B68]">
            Publicação no Instagram (Centro Fashion Fortaleza)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Criação de contêiner de mídia e publicação oficial no feed via Facebook Login ou Instagram Login, com validação de formato e prevenção de duplicações.
          </p>
        </div>

        {/* Alternador de Sub-Aba */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveSubTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'create'
                ? 'bg-white text-[#171B68] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nova Publicação
          </button>
          <button
            onClick={() => {
              setActiveSubTab('history');
              loadHistory();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'history'
                ? 'bg-white text-[#171B68] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Histórico de Publicações
            {history.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#F50087] text-white rounded-full text-[10px]">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 1. Painel de Status das Conexões & Permissões da Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Fluxo A: Facebook Login */}
        <div
          onClick={() => setSelectedFlow('facebook_login')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedFlow === 'facebook_login'
              ? 'bg-blue-50/60 border-blue-400 ring-2 ring-blue-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                FB
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Fluxo A: via Facebook Login
                </h3>
                <p className="text-[11px] text-slate-500">Página Centro Fashion Fortaleza</p>
              </div>
            </div>
            {selectedFlow === 'facebook_login' && (
              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                Selecionado
              </span>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">ID da Página FB:</span>
              <code className="font-mono font-semibold text-slate-800">
                {flowsStatus?.facebook_login_flow?.page_id || '1087804007911063'}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">ID Instagram Vinculado:</span>
              <code className="font-mono font-semibold text-slate-800">
                {flowsStatus?.facebook_login_flow?.linked_instagram_id || '17841402211050731'}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Permissão de Publicação:</span>
              {flowsStatus?.facebook_login_flow?.has_publish_permission ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> instagram_content_publish
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                  <AlertCircle className="w-3 h-3 text-amber-600" /> Pendente de Reautorização
                </span>
              )}
            </div>

            {!flowsStatus?.facebook_login_flow?.has_publish_permission && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReauth('facebook_login');
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Reautorizar com Permissão de Publicação
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card Fluxo B: Instagram Login */}
        <div
          onClick={() => setSelectedFlow('instagram_login')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedFlow === 'instagram_login'
              ? 'bg-pink-50/60 border-pink-400 ring-2 ring-pink-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF9900] via-[#F50087] to-[#7928CA] text-white flex items-center justify-center font-bold text-xs">
                IG
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Fluxo B: via Instagram Login
                </h3>
                <p className="text-[11px] text-slate-500">Perfil Oficial @centrofashionfor</p>
              </div>
            </div>
            {selectedFlow === 'instagram_login' && (
              <span className="text-[10px] font-bold bg-[#F50087] text-white px-2 py-0.5 rounded-full">
                Selecionado
              </span>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">ID da Conta no Instagram:</span>
              <code className="font-mono font-semibold text-slate-800">
                {flowsStatus?.instagram_login_flow?.account_id || '28311044841920160'}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tipo de Conta:</span>
              <span className="font-semibold text-slate-800">Profissional (Criador/Empresa)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Permissão de Publicação:</span>
              {flowsStatus?.instagram_login_flow?.has_publish_permission ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> instagram_business_content_publish
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                  <AlertCircle className="w-3 h-3 text-amber-600" /> Pendente de Reautorização
                </span>
              )}
            </div>

            {!flowsStatus?.instagram_login_flow?.has_publish_permission && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReauth('instagram_login');
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-[#F50087] hover:bg-[#D40073] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Reautorizar com Permissão de Publicação
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerta de Verificação de Permissões para Homologação */}
      {!hasPublishPermission && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">
              Permissão de Publicação Pendente no {selectedFlow === 'facebook_login' ? 'Fluxo A (Facebook Login)' : 'Fluxo B (Instagram Login)'}
            </div>
            <p>
              A conta conectada concedeu permissões básicas na Etapa 2. Para envio de postagens reais no feed oficial, a Meta exige{' '}
              <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-bold">
                {selectedFlow === 'facebook_login' ? 'instagram_content_publish' : 'instagram_business_content_publish'}
              </code>.
              Você pode clicar no botão <strong>Reautorizar com Permissão de Publicação</strong> acima para solicitar este escopo no diálogo oficial da Meta, ou testar a interface de montagem e validação normalmente.
            </p>
          </div>
        </div>
      )}

      {/* ABA 1: CRIAÇÃO & PRÉVIA */}
      {activeSubTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Configuração e Conteúdo (7 colunas) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Bloco 1: Seleção de Imagem */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#171B68] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#F50087]" /> 1. Imagem da Vitrine / Produto
                </h2>
                <div className="flex items-center bg-slate-100 p-1 rounded-lg text-[11px] font-semibold">
                  <button
                    onClick={() => setMediaSource('sample')}
                    className={`px-2.5 py-1 rounded ${
                      mediaSource === 'sample' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Vitrines Centro Fashion
                  </button>
                  <button
                    onClick={() => {
                      setMediaSource('upload');
                      fileInputRef.current?.click();
                    }}
                    className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                      mediaSource === 'upload' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <Upload className="w-3 h-3" /> Enviar Foto
                  </button>
                </div>
              </div>

              {/* Opção A: Vitrines Pré-cadastradas */}
              {mediaSource === 'sample' && (
                <div className="grid grid-cols-3 gap-3">
                  {samples.map((sample) => (
                    <div
                      key={sample.id}
                      onClick={() => handleSelectSample(sample.id)}
                      className={`cursor-pointer rounded-xl border overflow-hidden transition-all ${
                        selectedSampleId === sample.id
                          ? 'border-[#F50087] ring-2 ring-[#F50087]/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="aspect-square bg-slate-100 relative">
                        <img
                          src={sample.url}
                          alt={sample.title}
                          className="w-full h-full object-cover"
                        />
                        {selectedSampleId === sample.id && (
                          <div className="absolute top-1.5 right-1.5 bg-[#F50087] text-white p-1 rounded-full shadow-2xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-[11px]">
                        <p className="font-bold text-slate-800 truncate">{sample.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{sample.dimensions} · 1:1</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Opção B: Upload de Foto Própria */}
              {mediaSource === 'upload' && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#F50087] rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-4">
                        <RefreshCw className="w-6 h-6 text-[#F50087] animate-spin" />
                        <span className="text-xs text-slate-600 font-semibold">
                          Validando imagem conforme regras da Meta...
                        </span>
                      </div>
                    ) : uploadedMedia ? (
                      <div className="flex items-center justify-center gap-4">
                        <img
                          src={uploadedMedia.url}
                          alt="Foto carregada"
                          className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                        />
                        <div className="text-left text-xs">
                          <p className="font-bold text-slate-900">Foto carregada e validada com sucesso!</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Dimensões: {uploadedMedia.width}x{uploadedMedia.height}px · Proporção: {uploadedMedia.aspect_ratio}:1
                          </p>
                          <p className="text-[11px] text-emerald-600 font-bold mt-1">
                            ✓ Formato {uploadedMedia.format.toUpperCase()} · Tamanho {(uploadedMedia.size_bytes / 1024).toFixed(1)} KB
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="mt-2 text-[11px] text-[#F50087] font-bold hover:underline"
                          >
                            Trocar foto
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Upload className="w-5 h-5 text-slate-500" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Clique aqui para selecionar uma imagem do seu dispositivo
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Requisitos oficiais da Meta: JPEG ou PNG, largura mínima de 320px, proporção entre 4:5 e 1.91:1, até 8 MB.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Erro de validação de mídia */}
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Requisitos Técnicos da Meta com Badges */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Critérios Oficiais de Mídia da Meta (Instagram Feed)
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                  <div>✓ Formato: JPEG (.jpg) exigido no Feed (conversão auto ativa)</div>
                  <div>✓ Proporção: 4:5 (0.80) a 1.91:1 (1.91)</div>
                  <div>✓ Resolução: Mínimo 320px (Rec: 1080px)</div>
                  <div>✓ Tamanho máx: 8 MB por arquivo</div>
                </div>
              </div>
            </div>

            {/* Bloco 2: Legenda & Hashtags */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#171B68] flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#F50087]" /> 2. Legenda da Publicação
                </h2>
                <div className="text-[11px] text-slate-500 font-mono">
                  <span className={caption.length > 2200 ? 'text-rose-600 font-bold' : ''}>
                    {caption.length}
                  </span>{' '}
                  / 2.200 caracteres
                </div>
              </div>

              <div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Escreva a legenda para a vitrine do Centro Fashion Fortaleza..."
                  rows={5}
                  className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F50087]/20 focus:border-[#F50087] transition-all resize-y"
                />
              </div>

              {/* Tags Sugeridas do Centro Fashion */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-[#F50087]" /> Hashtags do Centro Fashion (Clique para adicionar):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {hashtagsSugeridas.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!caption.includes(tag)) {
                          setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
                        }
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-[#F50087]/10 hover:text-[#F50087] text-[11px] text-slate-700 font-medium transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botão de Avanço para Confirmação Explícita */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenConfirm}
                disabled={!activeMediaUrl}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                  activeMediaUrl
                    ? 'bg-[#171B68] hover:bg-[#121550] text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Avançar para Confirmação Pré-Disparo <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Nenhum conteúdo será publicado sem a sua conferência e confirmação explícita na próxima etapa.
              </p>
            </div>
          </div>

          {/* Coluna Direita: Prévia Aproximada (5 colunas) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2">
              <Eye className="w-4 h-4 text-[#F50087] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Prévia Aproximada (Instagram Feed)</strong>
                Esta é uma simulação de exibição no aplicativo do Instagram para validação do visual da foto e do enquadramento da legenda.
              </div>
            </div>

            {/* Mockup do Post do Instagram */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden max-w-[380px] mx-auto">
              {/* Cabeçalho do Perfil */}
              <div className="p-3 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#FF9900] via-[#F50087] to-[#7928CA]">
                    <div className="w-full h-full rounded-full bg-white p-[1px]">
                      <div className="w-full h-full rounded-full bg-[#171B68] flex items-center justify-center text-white text-[10px] font-bold">
                        CF
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      centrofashionfor
                    </span>
                    <span className="text-[10px] text-slate-400">Centro Fashion Fortaleza</span>
                  </div>
                </div>
                <span className="text-slate-400 text-sm font-bold">···</span>
              </div>

              {/* Imagem do Feed */}
              <div className="aspect-square bg-slate-100 relative">
                {activeMediaUrl ? (
                  <img
                    src={activeMediaUrl}
                    alt="Prévia da foto"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                    <Camera className="w-8 h-8 text-slate-300" />
                    <span>Nenhuma imagem selecionada</span>
                  </div>
                )}
              </div>

              {/* Botões de Interação */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Heart className="w-5 h-5 hover:text-red-500 transition-colors" />
                    <MessageCircle className="w-5 h-5" />
                    <Share2 className="w-5 h-5" />
                  </div>
                  <Bookmark className="w-5 h-5 text-slate-700" />
                </div>

                <div className="text-[11px] font-bold text-slate-900">
                  95.779 curtidas
                </div>

                {/* Texto da Legenda */}
                <div className="text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                  <span className="font-bold mr-1.5">centrofashionfor</span>
                  {caption || 'Legenda do post aparecerá aqui...'}
                </div>

                <div className="text-[10px] text-slate-400 uppercase tracking-wide pt-1">
                  Há poucos instantes · Prévia de Homologação
                </div>
              </div>
            </div>

            {/* Informações de Destino e IDs */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] space-y-1.5">
              <div className="font-bold text-slate-700 flex items-center justify-between">
                <span>Destino Selecionado:</span>
                <span className="text-[#171B68]">{targetAccountLabel}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>ID Meta Oficial:</span>
                <code className="font-mono font-bold text-slate-700">{targetNumericId}</code>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Canal:</span>
                <span>Instagram Graph API</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: HISTÓRICO DE PUBLICAÇÕES */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#171B68]">
                Histórico de Postagens no Feed
              </h2>
              <p className="text-xs text-slate-500">
                Registro auditado de publicações, contêineres criados e links diretos no Instagram.
              </p>
            </div>
            <button
              onClick={loadHistory}
              disabled={historyLoading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} /> Atualizar
            </button>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Camera className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Nenhuma publicação registrada ainda.</p>
              <p className="text-[11px] text-slate-400">
                Utilize a aba "Nova Publicação" para testar o envio de uma foto com legenda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((post) => (
                <div key={post.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <img
                      src={post.media_url}
                      alt="Thumbnail"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {post.account_name}
                        </span>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">
                          {post.flow === 'facebook_login' ? 'Fluxo A (FB Login)' : 'Fluxo B (IG Login)'}
                        </span>
                        {post.status === 'published' ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Publicado
                          </span>
                        ) : post.status === 'failed' ? (
                          <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600" /> Falha
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
                            Contêiner Criado
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-1 max-w-lg">
                        {post.caption || 'Sem legenda'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                        {post.meta_media_id && (
                          <span>ID Mídia: {post.meta_media_id}</span>
                        )}
                        {post.container_id && (
                          <span>Contêiner: {post.container_id}</span>
                        )}
                        <span>{new Date(post.created_at).toLocaleString('pt-BR')}</span>
                        <span>Por: {post.created_by_user_name}</span>
                      </div>

                      {post.error_details && (
                        <p className="text-[11px] text-rose-600 bg-rose-50 p-1.5 rounded mt-1">
                          Motivo: {post.error_details}
                        </p>
                      )}
                    </div>
                  </div>

                  {post.permalink && (
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#F50087] hover:text-white text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Ver no Instagram
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO EXPLÍCITA PRÉ-DISPARO */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho do Modal */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F50087]">
                  Confirmação Explícita Obrigatória
                </span>
                <h2 className="text-lg font-bold text-[#171B68]">
                  Confirmar Publicação no Feed
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isPublishing) setIsConfirmModalOpen(false);
                }}
                disabled={isPublishing}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Resumo da Publicação */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Destino Oficial:</span>
                  <span className="font-bold text-[#171B68]">{targetAccountLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Fluxo Escolhido:</span>
                  <span className="font-mono text-slate-700">
                    {selectedFlow === 'facebook_login' ? 'Facebook Login' : 'Instagram Login'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Identificador Meta (ID):</span>
                  <code className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {targetNumericId}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Chave de Idempotência:</span>
                  <code className="font-mono text-[10px] text-slate-500">
                    {idempotencyKey}
                  </code>
                </div>
              </div>

              {/* Mídia e Legenda */}
              <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <img
                  src={activeMediaUrl}
                  alt="Mídia"
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-1 overflow-hidden">
                  <span className="font-bold text-slate-800 block">Legenda da Publicação:</span>
                  <p className="text-[11px] text-slate-600 line-clamp-3 whitespace-pre-wrap">
                    {caption || '(Sem texto na legenda)'}
                  </p>
                </div>
              </div>

              {/* Alerta de Permissão Ausente se não tiver sido reautorizado ainda */}
              {!hasPublishPermission ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    Permissão de Publicação Ausente na Meta
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    A conta conectada precisa da permissão oficial{' '}
                    <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded text-amber-950">
                      {selectedFlow === 'facebook_login' ? 'instagram_content_publish' : 'instagram_business_content_publish'}
                    </code>{' '}
                    concedida no diálogo da Meta para poder enviar fotos no feed.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleReauth(selectedFlow)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#F50087] hover:bg-[#D40073] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reautorizar Conta na Meta Agora (Liberar Publicação)
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Pronto para Disparo: </strong>
                    A conta possui a permissão oficial concedida. Ao clicar em <em>Confirmar e Publicar Agora</em>, o contêiner de mídia será processado e o post será enviado para o Instagram.
                  </div>
                </div>
              )}

              {/* Feedback de Processamento / Resultado */}
              {publishingStep && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>{publishingStep}</span>
                </div>
              )}

              {publishResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    publishResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {publishResult.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Publicação Realizada com Sucesso!
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        Falha no Disparo para a Meta
                      </>
                    )}
                  </div>
                  {publishResult.success ? (
                    <div className="space-y-2">
                      <p className="text-[11px]">
                        O post já está disponível na conta oficial do Centro Fashion Fortaleza.
                      </p>
                      {publishResult.permalink && (
                        <a
                          href={publishResult.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-emerald-800 underline text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Acessar publicação no Instagram
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {publishResult.error && (
                        (publishResult.error.toLowerCase().includes('image format') ||
                        publishResult.error.includes('FORMATO_NAO_SUPORTADO')) && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] space-y-1.5">
                          <div className="font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Conversão Automática para JPEG sRGB Ativada
                          </div>
                          <p className="text-[10px] leading-relaxed text-amber-800">
                            A Meta Instagram Content Publishing API exige exclusivamente o formato <strong>JPEG (.jpg)</strong> para publicações no feed. O sistema gerou a versão JPEG oficial em alta fidelidade. Clique no botão de disparo abaixo para concluir a publicação.
                          </p>
                        </div>
                      ))}
                      {publishResult.isPermissionMissing && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => handleReauth(selectedFlow)}
                            className="w-full py-2 px-3 rounded-lg bg-[#F50087] hover:bg-[#D40073] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Reautorizar Conta na Meta (Liberar Publicação)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ações do Modal */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isPublishing}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 transition-colors"
              >
                {publishResult?.success ? 'Fechar' : 'Voltar para Edição'}
              </button>

              {!publishResult?.success && (
                <button
                  type="button"
                  onClick={handleExecutePublish}
                  disabled={isPublishing}
                  className="px-5 py-2 rounded-xl bg-[#171B68] hover:bg-[#121550] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Publicando...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Confirmar e Publicar Agora
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
