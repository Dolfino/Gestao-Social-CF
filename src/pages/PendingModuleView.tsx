import React from 'react';
import {
  Share2,
  Image,
  MessageSquare,
  Send,
  BarChart3,
  AlertCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ActiveTab } from '../components/Sidebar.js';

interface Props {
  tab: ActiveTab;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const PendingModuleView: React.FC<Props> = ({ tab, onNavigateTab }) => {
  const getModuleDetails = () => {
    switch (tab) {
      case 'accounts':
        return {
          etapaNumber: 2,
          title: 'Conexão de Contas (Facebook Login & Instagram Login)',
          icon: <Share2 className="w-6 h-6 text-[#F50087]" />,
          description:
            'Módulo para autenticação OAuth e identificação da Página oficial do Facebook e da conta profissional do Instagram.',
          flows: [
            {
              name: 'Fluxo A: Facebook Login for Business',
              permission: 'pages_show_list, pages_read_engagement, instagram_basic',
              endpoint: 'GET graph.facebook.com/{version}/me/accounts',
              status: 'Aguardando validação com a API real na Etapa 2',
            },
            {
              name: 'Fluxo B: Instagram API with Instagram Login',
              permission: 'instagram_business_basic',
              endpoint: 'GET graph.instagram.com/{version}/me',
              status: 'Aguardando validação com a API real na Etapa 2',
            },
          ],
          nextStep: 'Registrar o App ID e Secret no painel de configurações para iniciar a conexão da conta real na Etapa 2.',
        };
      case 'posts':
        return {
          etapaNumber: 3,
          title: 'Publicação no Instagram (Fotos de Moda & Vitrines)',
          icon: <Image className="w-6 h-6 text-[#F50087]" />,
          description:
            'Upload de foto com legenda, criação e processamento de contêiner de mídia na Graph API da Meta.',
          flows: [
            {
              name: 'Publicação Instagram via Facebook Login',
              permission: 'instagram_content_publish',
              endpoint: 'POST graph.facebook.com/{version}/{ig-user-id}/media e media_publish',
              status: 'Pendente de validação na Etapa 3',
            },
            {
              name: 'Publicação Instagram via Instagram Login',
              permission: 'instagram_business_content_publish',
              endpoint: 'POST graph.instagram.com/{version}/{ig-user-id}/media e media_publish',
              status: 'Pendente de validação na Etapa 3',
            },
          ],
          nextStep: 'Conectar as contas na Etapa 2 antes de publicar fotos reais.',
        };
      case 'comments':
        return {
          etapaNumber: 4,
          title: 'Gestão e Moderação de Comentários',
          icon: <MessageSquare className="w-6 h-6 text-[#F50087]" />,
          description:
            'Consulta de comentários públicos e envio de respostas oficiais aos clientes.',
          flows: [
            {
              name: 'Comentários via Facebook Login',
              permission: 'instagram_manage_comments',
              endpoint: 'GET /{media-id}/comments e POST /{comment-id}/replies',
              status: 'Pendente de validação na Etapa 4',
            },
            {
              name: 'Comentários via Instagram Login',
              permission: 'instagram_business_manage_comments',
              endpoint: 'GET /{media-id}/comments e POST /{comment-id}/replies',
              status: 'Pendente de validação na Etapa 4',
            },
          ],
          nextStep: 'Disponível após homologação das contas conectadas na Etapa 2.',
        };
      case 'messages':
        return {
          etapaNumber: 5,
          title: 'Atendimento SAC (Instagram Direct & Messenger)',
          icon: <Send className="w-6 h-6 text-[#F50087]" />,
          description:
            'Caixa de atendimento unificada para suporte ao cliente no Direct do Instagram e Messenger da Página.',
          flows: [
            {
              name: 'Instagram Direct via Facebook Login',
              permission: 'instagram_manage_messages',
              endpoint: 'Webhook messages + POST /{ig-user-id}/messages',
              status: 'Pendente de validação na Etapa 5',
            },
            {
              name: 'Instagram Direct via Instagram Login',
              permission: 'instagram_business_manage_messages',
              endpoint: 'Webhook messages + POST /{ig-user-id}/messages',
              status: 'Pendente de validação na Etapa 5',
            },
            {
              name: 'Facebook Messenger da Página',
              permission: 'pages_messaging',
              endpoint: 'Webhook messages + POST /me/messages',
              status: 'Pendente de validação na Etapa 5',
            },
          ],
          nextStep: 'Configurar Webhooks com HMAC-SHA256 e validação na Etapa 5.',
        };
      case 'insights':
        return {
          etapaNumber: 6,
          title: 'Métricas & Insights Oficiais',
          icon: <BarChart3 className="w-6 h-6 text-[#F50087]" />,
          description:
            'Painel de alcance, interações totais e visualizações agregadas da conta oficial.',
          flows: [
            {
              name: 'Métricas da Conta via Facebook Login',
              permission: 'instagram_manage_insights',
              endpoint: 'GET /{ig-user-id}/insights?metric=reach,total_interactions',
              status: 'Pendente de validação na Etapa 6',
            },
            {
              name: 'Métricas de Mídia via Instagram Login',
              permission: 'instagram_business_basic',
              endpoint: 'GET /{ig-media-id}/insights?metric=reach,total_interactions',
              status: 'Pendente de validação na Etapa 6',
            },
          ],
          nextStep: 'Será ativado após conectar a conta com métricas acumuladas na Etapa 6.',
        };
      default:
        return {
          etapaNumber: 0,
          title: 'Módulo em Planejamento',
          icon: <Clock className="w-6 h-6 text-slate-400" />,
          description: 'Módulo aguardando liberação.',
          flows: [],
          nextStep: '',
        };
    }
  };

  const info = getModuleDetails();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          {info.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#F50087] uppercase tracking-wider">
              Etapa {info.etapaNumber}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.2 rounded font-mono">
              PENDENTE DE VALIDAÇÃO COM API REAL
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#171B68] mt-0.5">{info.title}</h1>
        </div>
      </div>

      {/* Alerta de Diretriz de Auditoria: Não declarar concluído antes da validação real */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-bold text-amber-800">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          Diretriz de Transparência do Meta App Review:
        </div>
        <p>
          Este módulo está <strong>formalmente identificado como pendente</strong>. Conforme a regra de execução nº 5, uma funcionalidade não é declarada concluída até que a chamada oficial à Graph API seja executada com sucesso contra os servidores da Meta e comprovada em vídeo real.
        </p>
      </div>

      {/* Fluxos e Endpoints Previstos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h2 className="text-sm font-bold text-[#171B68]">
            Fluxos Oficiais Separados para Esta Funcionalidade
          </h2>
          <p className="text-xs text-slate-500">
            Cada fluxo utiliza seu próprio conjunto de permissões, endpoints e tokens de acesso
          </p>
        </div>

        <div className="p-6 space-y-4">
          {info.flows.map((f, idx) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{f.name}</span>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold">
                  {f.status}
                </span>
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Permissões Meta: </span>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-[#171B68]">
                  {f.permission}
                </code>
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Host e Endpoint: </span>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                  {f.endpoint}
                </code>
              </div>
            </div>
          ))}

          {/* Próximo Passo */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              <strong>Pré-requisito:</strong> {info.nextStep}
            </div>
            <button
              onClick={() => onNavigateTab('app_review')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#171B68] hover:bg-[#0E1146] rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Ver Matriz no Preparador</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
