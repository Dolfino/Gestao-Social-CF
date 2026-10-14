import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface Props {
  onBack?: () => void;
}

export const TermsView: React.FC<Props> = ({ onBack }) => {
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
              <h1 className="text-xl font-bold tracking-tight">Termos de Serviço</h1>
              <p className="text-xs text-slate-300">Centro Fashion Fortaleza — Sistema Interno de Gestão Social</p>
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
        <div className="p-8 space-y-6 text-slate-700 text-sm leading-relaxed">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            <strong>Vigência:</strong> A partir de 13 de outubro de 2026 · Versão 1.1
            <br />
            <strong>Destinatários:</strong> Colaboradores, operadores de atendimento e analistas autorizados do Centro Fashion Fortaleza.
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#171B68]">1. Aceitação e Objeto</h2>
            <p>
              Estes Termos de Serviço regem o acesso e a utilização da plataforma interna de gestão de redes sociais do <strong>Centro Fashion Fortaleza</strong>. O acesso é estritamente condicionado ao vínculo corporativo e à autorização de credenciais individuais concedidas pela administração.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#171B68]">2. Uso Autorizado e Responsabilidades do Operador</h2>
            <p>
              Ao utilizar a aplicação para gerenciar a Página do Facebook ou a Conta Profissional do Instagram, o operador compromete-se a:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Utilizar as permissões de publicação, comentários e atendimento exclusivamente no âmbito das operações comerciais do Centro Fashion Fortaleza.</li>
              <li>Não tentar acessar, extrair ou divulgar chaves secretas, tokens de acesso ou senhas de outros colaboradores.</li>
              <li>Respeitar as políticas oficiais da Meta, incluindo as Diretrizes da Comunidade do Facebook e Instagram e as regras de janelas de atendimento ao cliente (24 horas).</li>
              <li>Registrar todas as interações de forma profissional e compatível com os padrões de atendimento do shopping.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#171B68]">3. Segurança e Auditoria</h2>
            <p>
              Todas as ações executadas no sistema (login, alteração de configurações, publicações e respostas) são registradas no módulo interno de auditoria, contendo carimbo de data/hora, identificador de usuário e status de execução para fins de conformidade e segurança da informação.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#171B68]">4. Cancelamento de Acesso e Revogação</h2>
            <p>
              O Centro Fashion Fortaleza reserva-se o direito de suspender ou revogar o acesso de qualquer usuário imediatamente em caso de desligamento corporativo, violação das normas de segurança da informação ou descumprimento das políticas das plataformas parceiras.
            </p>
          </section>
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>© 2026 Centro Fashion Fortaleza.</span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Termos em conformidade com as Políticas de Plataforma da Meta
          </span>
        </div>
      </div>
    </div>
  );
};
