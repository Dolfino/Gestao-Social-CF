import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types.js';
import {
  ShieldAlert,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { safeStorage } from '../utils/storage.js';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    const token = safeStorage.getItem('cf_token');

    try {
      const res = await fetch('/api/audit-logs?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Falha ao buscar logs de auditoria.');
      } else {
        setLogs(data.logs || []);
      }
    } catch {
      setError('Erro de rede ao carregar registros de auditoria.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      (log.user_name && log.user_name.toLowerCase().includes(term)) ||
      (log.endpoint && log.endpoint.toLowerCase().includes(term)) ||
      (log.resource_id && log.resource_id.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#171B68]">
            Auditoria & Rastreamento de Operações
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Histórico imutável de chamadas, logins e alterações com sanitização estruturada estrita.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#F50087]' : ''}`} />
          <span>Atualizar Registros</span>
        </button>
      </div>

      {/* Banner de Garantia de Sanitização */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-3 text-xs text-indigo-900">
        <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Política Estrita de Não Exposição de Segredos: </span>
          <span>
            Todos os logs passam por sanitização por lista branca de propriedades. Nenhuma chave secreta (<em>app_secret</em>), token de acesso (<em>access_token</em>), senha ou parâmetro sensível de URL trafega pela interface ou é salvo no banco SQLite.
          </span>
        </div>
      </div>

      {/* Barra de Busca e Filtro */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por ação, usuário, endpoint ou recurso..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#F50087] text-slate-900"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabela de Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Data e Hora</th>
                <th className="py-3 px-4">Ação</th>
                <th className="py-3 px-4">Usuário / Papel</th>
                <th className="py-3 px-4">Endpoint Sanitizado</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {loading ? 'Carregando histórico de auditoria...' : 'Nenhum registro de auditoria encontrado.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSuccess = log.http_status >= 200 && log.http_status < 400;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#171B68]">
                        {log.action}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {log.user_name || 'Sistema / Público'}
                        </div>
                        {log.role && (
                          <div className="text-[10px] text-slate-500 uppercase font-mono">
                            {log.role}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 truncate max-w-xs" title={log.endpoint}>
                        {log.endpoint}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                            isSuccess
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {isSuccess ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                          {log.http_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#171B68] hover:text-[#F50087] bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes do Payload Sanitizado */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#171B68] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Detalhes da Chamada de Auditoria</h3>
                <p className="text-[11px] text-slate-300 font-mono">{selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-300 hover:text-white text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Ação: </span>
                  <strong className="text-slate-900">{selectedLog.action}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Status HTTP: </span>
                  <strong className="font-mono text-slate-900">{selectedLog.http_status}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Usuário: </span>
                  <span>{selectedLog.user_name || 'Sistema'}</span>
                </div>
                <div>
                  <span className="text-slate-500">IP de Origem: </span>
                  <span className="font-mono">{selectedLog.ip}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Payload Sanitizado (JSON Seguro):</span>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto max-h-56">
                  {JSON.stringify(JSON.parse(selectedLog.details_json || '{}'), null, 2)}
                </pre>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                Data do registro: {new Date(selectedLog.created_at).toISOString()}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#171B68] hover:bg-[#0E1146] rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
