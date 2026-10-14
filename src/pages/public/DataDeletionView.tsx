import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Search, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  onBack?: () => void;
  initialCode?: string;
}

export const DataDeletionView: React.FC<Props> = ({ onBack, initialCode }) => {
  const [code, setCode] = useState(initialCode || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    confirmation_code?: string;
    status?: string;
    requested_at?: string;
    completed_at?: string;
    message?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Se houver código na URL (ex: ?code=XYZ), consulta automaticamente
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryCode = urlParams.get('code') || initialCode;
    if (queryCode) {
      setCode(queryCode);
      handleSearch(queryCode);
    }
  }, [initialCode]);

  const handleSearch = async (codeToSearch: string) => {
    const target = codeToSearch.trim();
    if (!target) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/meta/data-deletion/status/${encodeURIComponent(target)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Protocolo não encontrado.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Falha de conexão com o servidor ao consultar protocolo de exclusão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-[#171B68] px-6 py-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F50087] flex items-center justify-center text-white font-bold text-lg">
              CF
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Instruções e Consulta de Exclusão de Dados</h1>
              <p className="text-xs text-slate-300">Meta Platform Data Deletion Callback & Status Tracker</p>
            </div>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Painel
            </button>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-8 space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Caixa de Consulta de Protocolo */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#171B68] font-bold text-base">
              <Search className="w-5 h-5 text-[#F50087]" />
              Consultar Protocolo de Exclusão da Meta
            </div>
            <p className="text-xs text-slate-600">
              Caso você tenha removido o aplicativo no Facebook ou Instagram e recebido um código de confirmação (<em>confirmation_code</em>), digite-o abaixo para verificar a conclusão da exclusão nos servidores do Centro Fashion Fortaleza.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(code);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Exemplo: del_9a8b7c6d5e4f"
                className="flex-1 px-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#F50087] font-mono"
              />
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="px-5 py-2 text-sm font-medium text-white bg-[#F50087] hover:bg-[#D60074] rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Consultando...' : 'Verificar Status'}
              </button>
            </form>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {result && result.found && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Protocolo Validado e Excluído com Sucesso
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono">
                  <div>
                    <span className="text-emerald-700 font-sans">Código de Confirmação: </span>
                    <strong>{result.confirmation_code}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 font-sans">Status no Banco: </span>
                    <strong className="uppercase">{result.status}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 font-sans">Data da Solicitação: </span>
                    <span>{result.requested_at ? new Date(result.requested_at).toLocaleString('pt-BR') : '-'}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 font-sans">Conclusão Efetiva: </span>
                    <span>{result.completed_at ? new Date(result.completed_at).toLocaleString('pt-BR') : '-'}</span>
                  </div>
                </div>
                <p className="pt-2 text-emerald-800 border-t border-emerald-200 font-sans">
                  {result.message}
                </p>
              </div>
            )}
          </div>

          {/* Instruções para o Usuário e Avaliador Meta */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171B68] flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#F50087]" />
              Como solicitar a exclusão de dados do Facebook / Instagram
            </h2>
            <p>
              Conforme as Políticas de Plataforma da Meta e a LGPD, o Centro Fashion Fortaleza disponibiliza mecanismos transparentes e automáticos para exclusão de dados:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong>Pelo Aplicativo do Facebook:</strong> Vá em <em>Configurações e Privacidade &gt; Configurações &gt; Aplicativos e Sites</em>, localize <em>Centro Fashion Fortaleza — Gestão Social</em> e clique em <strong>Remover</strong>.
              </li>
              <li>
                <strong>Pelo Aplicativo do Instagram:</strong> Vá em <em>Configurações e Atividade &gt; Permissões do Site &gt; Aplicativos e Sites</em>, selecione o aplicativo e clique em <strong>Remover</strong>.
              </li>
              <li>
                <strong>Callback Automático (Data Deletion Request Callback):</strong> Ao remover o aplicativo, a Meta envia uma requisição assinada (<em>signed_request</em>) diretamente para o endpoint oficial da nossa aplicação:
                <br />
                <code className="text-xs bg-slate-100 text-[#171B68] px-2 py-0.5 rounded font-mono block mt-1">
                  POST /api/meta/data-deletion
                </code>
              </li>
              <li>
                <strong>Processamento Imediato e Seguro:</strong> Nosso servidor valida a assinatura HMAC-SHA256 utilizando o <em>App Secret</em>, identifica o identificador do usuário e purga permanentemente todos os tokens e registros associados na base de dados SQLite.
              </li>
              <li>
                <strong>Comprovante Rastreável:</strong> A Meta recebe como resposta o código de confirmação e a URL direta desta página para acompanhamento.
              </li>
            </ol>
          </section>

          {/* Informações Técnicas para o App Review */}
          <section className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#171B68]" />
              Informações Técnicas para o Avaliador do Meta App Review
            </div>
            <p>
              • <strong>Callback URL configurada no painel da Meta:</strong> <code className="font-mono text-slate-800">{window.location.origin}/api/meta/data-deletion</code>
            </p>
            <p>
              • <strong>Instruções do Usuário (Data Deletion Instructions URL):</strong> <code className="font-mono text-slate-800">{window.location.origin}/exclusao-dados</code>
            </p>
          </section>
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>© 2026 Centro Fashion Fortaleza.</span>
          <span className="text-[#171B68] font-medium">Cumprimento estrito das regras de exclusão de dados da Meta</span>
        </div>
      </div>
    </div>
  );
};
