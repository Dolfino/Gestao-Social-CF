import React from 'react';
import {
  LayoutDashboard,
  Settings,
  ShieldAlert,
  FileCheck2,
  Users2,
  Share2,
  Image,
  MessageSquare,
  Send,
  BarChart3,
  Lock,
} from 'lucide-react';
import { UserRole } from '../types.js';

export type ActiveTab =
  | 'overview'
  | 'config'
  | 'audit'
  | 'app_review'
  | 'accounts'
  | 'posts'
  | 'comments'
  | 'messages'
  | 'insights';

interface Props {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userRole?: UserRole;
}

export const Sidebar: React.FC<Props> = ({ activeTab, onSelectTab, userRole }) => {
  const isActionAllowed = (tab: ActiveTab) => {
    // Reviewer e Operador não alteram configurações de produção, mas podem visualizar no modo leitura
    return true;
  };

  return (
    <aside className="w-64 bg-[#171B68] text-white flex flex-col shrink-0 border-r border-slate-800 select-none">
      <div className="p-4 border-b border-slate-800">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Módulos do Sistema
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* MÓDULOS ETAPA 1: BASE FUNCIONAL */}
        <button
          onClick={() => onSelectTab('overview')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-[#F50087] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Visão Geral</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[9px]">Ativo</span>
        </button>

        <button
          onClick={() => onSelectTab('config')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'config'
              ? 'bg-[#F50087] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 shrink-0" />
            <span>Configurações Meta</span>
          </div>
          {userRole !== 'admin' && (
            <span title="Apenas leitura para seu perfil">
              <Lock className="w-3 h-3 text-slate-400" />
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('audit')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'audit'
              ? 'bg-[#F50087] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Auditoria & Logs</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[9px]">Ativo</span>
        </button>

        <button
          onClick={() => onSelectTab('app_review')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'app_review'
              ? 'bg-[#F50087] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="w-4 h-4 shrink-0" />
            <span>Preparador App Review</span>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[9px]">Matriz</span>
        </button>

        {/* SEPARADOR DE MÓDULOS DE INTEGRAÇÃO DA META */}
        <div className="pt-4 pb-1 px-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Integrações Meta API</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded">Etapas 2–6</span>
          </div>
        </div>

        <button
          onClick={() => onSelectTab('accounts')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'accounts'
              ? 'bg-[#F50087] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Contas Conectadas</span>
          </div>
          <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-semibold">Etapa 2</span>
        </button>

        <button
          onClick={() => onSelectTab('posts')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'posts'
              ? 'bg-[#F50087] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Image className="w-4 h-4 shrink-0" />
            <span>Publicações</span>
          </div>
          <span className="text-[9px] text-amber-300/80 font-mono">Pendente</span>
        </button>

        <button
          onClick={() => onSelectTab('comments')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'comments'
              ? 'bg-[#F50087] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Comentários</span>
          </div>
          <span className="text-[9px] text-amber-300/80 font-mono">Pendente</span>
        </button>

        <button
          onClick={() => onSelectTab('messages')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'messages'
              ? 'bg-[#F50087] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Send className="w-4 h-4 shrink-0" />
            <span>Atendimento SAC</span>
          </div>
          <span className="text-[9px] text-amber-300/80 font-mono">Pendente</span>
        </button>

        <button
          onClick={() => onSelectTab('insights')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'insights'
              ? 'bg-[#F50087] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Métricas & Insights</span>
          </div>
          <span className="text-[9px] text-amber-300/80 font-mono">Pendente</span>
        </button>
      </nav>

      {/* Rodapé informativo da barra lateral */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>Banco SQLite:</span>
          <span className="text-emerald-400 font-medium">Persistente</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span>Meta API Versão:</span>
          <span className="text-slate-200 font-mono">v22.0</span>
        </div>
      </div>
    </aside>
  );
};
