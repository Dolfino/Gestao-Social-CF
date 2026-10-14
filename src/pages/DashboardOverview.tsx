import React from 'react';
import { User, EnvironmentUrls, MetaConfig } from '../types.js';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Database,
  Lock,
  Globe,
  ArrowRight,
  Server,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  user: User;
  metaConfig: MetaConfig | null;
  envUrls: EnvironmentUrls | null;
  onNavigateTab: (tab: any) => void;
}

export const DashboardOverview: React.FC<Props> = ({
  user,
  metaConfig,
  envUrls,
  onNavigateTab,
}) => {
  const isEncryptionOk = metaConfig?.encryption_status?.configured;

  return (
    <div className="space-y-6">
      {/* Banner de Boas-vindas e Identidade */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F50087]">
              Ambiente Interno
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Etapa 1 — Base Funcional</span>
          </div>
          <h1 className="text-xl font-bold text-[#171B68]">
            Centro Fashion Fortaleza — Painel de Gestão Social
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Sessão autenticada como <strong>{user.name}</strong> ({user.email}) · Perfil: <span className="font-semibold uppercase text-[#F50087]">{user.role}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateTab('config')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#171B68] hover:bg-[#0E1146] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Configurações Meta</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateTab('app_review')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#F50087] hover:bg-[#D60074] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Matriz App Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Indicadores de Integridade e Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Banco SQLite */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Persistência Local</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            SQLite Ativo
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            data/centrofashion.db
          </div>
        </div>

        {/* Card 2: Criptografia AES-256-GCM */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Proteção de Segredos</span>
            <Lock className="w-4 h-4 text-[#F50087]" />
          </div>
          <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            {isEncryptionOk ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AES-256-GCM Ativo</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-700">Chave Ausente</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-500 truncate" title={metaConfig?.encryption_status?.message}>
            {isEncryptionOk ? 'Chave permanente configurada' : 'Bloqueio de segredos ativo'}
          </div>
        </div>

        {/* Card 3: RBAC e Sessão */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Controle de Acesso</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-slate-900 capitalize">
            Perfil {user.role}
          </div>
          <div className="text-[11px] text-slate-500">
            {user.role === 'admin'
              ? 'Gestão total de credenciais'
              : user.role === 'reviewer'
              ? 'Ambiente de auditoria restrito'
              : 'Operação social diária'}
          </div>
        </div>

        {/* Card 4: Endereço Público HTTPS */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Ambiente HTTPS</span>
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-base font-bold text-slate-900 flex items-center gap-1">
            <Server className="w-4 h-4 text-blue-600" />
            Disponível
          </div>
          <div className="text-[11px] text-slate-500 truncate font-mono" title={envUrls?.base_url}>
            {envUrls?.base_url || 'Detectando host...'}
          </div>
        </div>
      </div>

      {/* Roteiro das Etapas: Concluídas vs Pendentes com API Real */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#171B68]">
              Roteiro de Validação das Etapas
            </h2>
            <p className="text-xs text-slate-500">
              Evolução modular do projeto conforme as regras estritas de homologação da Meta
            </p>
          </div>
          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
            Etapa 1 de 7 Entregue
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {/* ETAPA 1 */}
          <div className="p-4 flex items-start justify-between gap-4 bg-emerald-50/30">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>Etapa 1 — Base Funcional & Conformidade Regulatória</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded font-semibold">
                    CONCLUÍDO & VALIDADO
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Login interno com 3 perfis (Admin, Operador, Reviewer), banco SQLite persistente, criptografia AES-256-GCM para segredos, painel de configurações da Meta, registro estruturado de auditoria e páginas públicas obrigatórias (Privacidade, Termos e Callback de Exclusão de Dados).
                </p>
              </div>
            </div>
          </div>

          {/* ETAPA 2 */}
          <div className="p-4 flex items-start justify-between gap-4 bg-blue-50/20">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>Etapa 2 — Conexão de Contas (Facebook Login & Instagram Login)</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.2 rounded font-semibold font-mono">
                    OAUTH IMPLEMENTADO
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Fluxos OAuth oficiais implementados e validados no backend. Geração de state CSRF descartável, troca de tokens protegida no servidor e persistência no SQLite. Validação real pronta para login do operador com conta Meta autorizada.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('accounts')}
              className="text-xs text-[#F50087] font-semibold hover:underline shrink-0"
            >
              Conectar Contas
            </button>
          </div>

          {/* ETAPA 3 */}
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>Etapa 3 — Publicação de Foto com Legenda no Instagram</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded font-semibold">
                    PENDENTE
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Criação e processamento de contêiner de mídia na Graph API oficial, prevenção de duplicidade e link da publicação real retornado.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('posts')}
              className="text-xs text-slate-500 hover:text-slate-900 shrink-0"
            >
              Ver Módulo
            </button>
          </div>

          {/* ETAPA 4 */}
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                4
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>Etapa 4 — Gestão e Resposta a Comentários Reais</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded font-semibold">
                    PENDENTE
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Consulta de comentários em posts ativos e envio de réplicas manuais pela API.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('comments')}
              className="text-xs text-slate-500 hover:text-slate-900 shrink-0"
            >
              Ver Módulo
            </button>
          </div>

          {/* ETAPA 5 */}
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                5
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>Etapa 5 — Atendimento SAC (Direct do Instagram e Messenger)</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded font-semibold">
                    PENDENTE
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Webhooks assinados via HMAC-SHA256, recepção de mensagens em tempo real e resposta dentro da janela de atendimento de 24 horas.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('messages')}
              className="text-xs text-slate-500 hover:text-slate-900 shrink-0"
            >
              Ver Módulo
            </button>
          </div>

          {/* ETAPA 6 */}
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                6
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>Etapa 6 — Métricas e Insights Oficiais</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded font-semibold">
                    PENDENTE
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Consulta de alcance, interações e visualizações por período, sem conversão indevida de dados ausentes em zero.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('insights')}
              className="text-xs text-slate-500 hover:text-slate-900 shrink-0"
            >
              Ver Módulo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
