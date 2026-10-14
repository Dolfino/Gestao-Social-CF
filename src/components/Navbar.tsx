import React from 'react';
import { User } from '../types.js';
import { LogOut, ExternalLink, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

interface Props {
  user: User | null;
  currentViewTitle: string;
  onLogout: () => void;
  onNavigatePublic: (page: 'privacy' | 'terms' | 'deletion') => void;
  onChangePassword?: () => void;
}

export const Navbar: React.FC<Props> = ({
  user,
  currentViewTitle,
  onLogout,
  onNavigatePublic,
  onChangePassword,
}) => {
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador', color: 'bg-indigo-900 text-indigo-100 border-indigo-700' };
      case 'operator':
        return { label: 'Operador Social', color: 'bg-blue-900 text-blue-100 border-blue-700' };
      case 'reviewer':
        return { label: 'Avaliador Meta', color: 'bg-emerald-900 text-emerald-100 border-emerald-700' };
      default:
        return { label: 'Colaborador', color: 'bg-slate-700 text-slate-200 border-slate-600' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <header className="h-16 bg-[#171B68] border-b border-slate-700 text-white flex items-center justify-between px-6 shrink-0 z-20">
      {/* Zona 1: Título e Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F50087] flex items-center justify-center font-bold text-white text-sm shadow-xs">
            CF
          </div>
          <span className="font-bold text-base tracking-tight whitespace-nowrap text-white">
            Centro Fashion Fortaleza
          </span>
        </div>
        <span className="text-slate-500">/</span>
        <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
          {currentViewTitle}
        </span>
      </div>

      {/* Zona 2: Acesso rápido a páginas públicas regulatórias */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-slate-300">
        <button
          onClick={() => onNavigatePublic('privacy')}
          className="hover:text-white transition-colors flex items-center gap-1"
        >
          <span>Privacidade</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>
        <span className="text-slate-600">·</span>
        <button
          onClick={() => onNavigatePublic('terms')}
          className="hover:text-white transition-colors flex items-center gap-1"
        >
          <span>Termos</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>
        <span className="text-slate-600">·</span>
        <button
          onClick={() => onNavigatePublic('deletion')}
          className="hover:text-white transition-colors flex items-center gap-1 text-[#F50087]"
        >
          <span>Exclusão de Dados</span>
          <ExternalLink className="w-3 h-3 text-[#F50087]" />
        </button>
      </div>

      {/* Zona 3: Perfil do Colaborador & Logout */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 text-right">
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
              <div className="text-[10px] text-slate-400">{user.email}</div>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.color} flex items-center gap-1`}
            >
              {user.role === 'reviewer' ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
              {roleInfo.label}
            </span>
          </div>
        )}

        {user && (
          <button
            onClick={onChangePassword}
            title="Alterar minha senha de acesso"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-400 hover:text-[#F50087]" />
            <span className="hidden sm:inline">Trocar Senha</span>
          </button>
        )}

        <button
          onClick={onLogout}
          title="Encerrar sessão interna"
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
        >
          <LogOut className="w-4 h-4 text-slate-400 hover:text-[#F50087]" />
          <span className="hidden md:inline">Sair</span>
        </button>
      </div>
    </header>
  );
};
