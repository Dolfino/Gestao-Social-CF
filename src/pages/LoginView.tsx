import React, { useState } from 'react';
import { User } from '../types.js';
import { Lock, Mail, ShieldAlert, CheckCircle2, ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';

import { safeStorage } from '../utils/storage.js';

interface Props {
  onLoginSuccess: (user: User, token: string) => void;
  onNavigatePublic: (page: 'privacy' | 'terms' | 'deletion') => void;
}

export const LoginView: React.FC<Props> = ({ onLoginSuccess, onNavigatePublic }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Credenciais inválidas.');
      } else {
        safeStorage.setItem('cf_token', data.token);
        onLoginSuccess(data.user, data.token);
      }
    } catch {
      setError('Falha de conexão com o servidor interno. Verifique se o backend está em execução.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Marca Centro Fashion */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#171B68] text-white shadow-md border-2 border-[#F50087] mb-3">
          <span className="text-[#F50087] font-black text-2xl tracking-tighter">CF</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171B68]">
          Centro Fashion Fortaleza
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Plataforma Interna de Gestão Social & Meta App Review
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail corporativo
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colaborador@centrofashion.com.br"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#F50087] text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Senha de acesso
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#F50087] text-slate-900"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-[#F50087] hover:bg-[#D60074] focus:outline-hidden transition-colors disabled:opacity-50"
              >
                {loading ? 'Validando credenciais...' : 'Entrar no Sistema'}
              </button>
            </div>
          </form>

          {/* Atalhos de Teste para Avaliação do App Review e Equipe */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Perfis de Acesso Rápido</span>
              <span className="text-[9px] text-[#171B68] font-bold">RBAC Ativo</span>
            </div>
            
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillQuickLogin('admin@centrofashion.com.br', 'Admin@CentroFashion2026!')}
                className="w-full text-left px-3 py-2 text-xs rounded-lg border border-slate-200 hover:border-[#171B68] hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-[#171B68]">1. Administrador Centro Fashion</div>
                  <div className="text-[10px] text-slate-500">Acesso completo: credenciais, usuários e auditoria</div>
                </div>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">admin</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickLogin('operador@centrofashion.com.br', 'Operador@CentroFashion2026!')}
                className="w-full text-left px-3 py-2 text-xs rounded-lg border border-slate-200 hover:border-[#171B68] hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-[#171B68]">2. Operador Social (Equipe)</div>
                  <div className="text-[10px] text-slate-500">Operação diária: posts, comentários e mensagens</div>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">operator</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickLogin('reviewer@meta.com', 'MetaReviewer2026!')}
                className="w-full text-left px-3 py-2 text-xs rounded-lg border border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-emerald-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    3. Avaliador Meta App Review
                  </div>
                  <div className="text-[10px] text-emerald-700">Acesso restrito para auditoria e gravação de telas</div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">reviewer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Links Públicos de Conformidade da Meta */}
        <div className="mt-6 text-center text-xs text-slate-500 space-x-3">
          <button
            onClick={() => onNavigatePublic('privacy')}
            className="hover:text-[#171B68] underline inline-flex items-center gap-1"
          >
            Política de Privacidade
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigatePublic('terms')}
            className="hover:text-[#171B68] underline inline-flex items-center gap-1"
          >
            Termos de Serviço
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigatePublic('deletion')}
            className="hover:text-[#F50087] underline inline-flex items-center gap-1 text-[#F50087] font-medium"
          >
            Exclusão de Dados
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
