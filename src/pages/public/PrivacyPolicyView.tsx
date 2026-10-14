import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

interface Props {
  onBack?: () => void;
}

export const PrivacyPolicyView: React.FC<Props> = ({ onBack }) => {
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
              <h1 className="text-xl font-bold tracking-tight">Política de Privacidade</h1>
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
            <strong>Última atualização:</strong> 13 de outubro de 2026 · Versão 1.2
            <br />
            <strong>Responsável:</strong> Centro Fashion Fortaleza (Av. Filomeno Gomes, 430 - Jacarecanga, Fortaleza - CE)
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#171B68]">1. Finalidade do Aplicativo</h2>
            <p>
              O sistema <strong>Centro Fashion Fortaleza — Gestão Social</strong> é uma aplicação corporativa de uso restrito, desenvolvida para possibilitar aos colaboradores autorizados o gerenciamento oficial das páginas de Facebook e contas profissionais de Instagram do Centro Fashion Fortaleza.
            </p>
            <p>
              O aplicativo opera exclusivamente para publicação de catálogos e conteúdos de moda, resposta a comentários públicos de clientes, atendimento a mensagens diretas de suporte no Messenger e Instagram Direct, e acompanhamento de métricas agregadas de engajamento.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#171B68]">2. Dados Coletados e Tratamento</h2>
            <p>
              O aplicativo coleta e processa estritamente os dados necessários para as funcionalidades autorizadas pelas APIs oficiais da Meta:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Identificadores de Contas e Páginas:</strong> IDs numéricos da Página do Facebook e da conta comercial do Instagram vinculada.</li>
              <li><strong>Conteúdo Social Público:</strong> Publicações, fotos de vitrines, legendas e comentários de clientes em posts públicos.</li>
              <li><strong>Mensagens de Atendimento:</strong> Texto das mensagens recebidas via Messenger e Instagram Direct com a finalidade exclusiva de atendimento ao cliente durante a janela de atendimento permitida.</li>
              <li><strong>Métricas Agregadas:</strong> Indicadores de alcance, impressões e interações fornecidos pela Meta Graph API, sem dados de identificação pessoal dos seguidores.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#171B68]">3. Armazenamento Seguro e Não Compartilhamento</h2>
            <p>
              Tokens de acesso são armazenados de forma criptografada no servidor backend através de criptografia AES-256-GCM. Segredos e credenciais nunca são expostos em navegadores de clientes, arquivos estáticos ou logs de auditoria.
            </p>
            <p>
              Os dados não são vendidos, alugados ou compartilhados com terceiros para fins de marketing, publicidade comportamental ou treinamento de modelos de inteligência artificial de terceiros.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#171B68]">4. Exclusão e Desconexão de Dados (Meta Data Deletion)</h2>
            <p>
              Em conformidade com as diretrizes da Meta Platform e a LGPD (Lei Geral de Proteção de Dados), qualquer usuário que deseje revogar autorizações ou solicitar a exclusão de seus dados pode:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Acessar as configurações de segurança do Facebook ou Instagram em <em>Aplicativos e Sites</em> e remover o aplicativo.</li>
              <li>Acessar nossa página pública de <a href="/exclusao-dados" className="text-[#F50087] font-semibold underline">Exclusão de Dados</a> para consultar o status de seu protocolo de exclusão ou enviar uma solicitação direta.</li>
              <li>O sistema processa automaticamente o callback oficial de exclusão de dados da Meta (<em>Data Deletion Request Callback</em>), gerando código de confirmação rastreável.</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#171B68]">5. Contato do Encarregado de Dados (DPO)</h2>
            <p>
              Para dúvidas sobre esta política ou tratamento de dados pessoais, entre em contato com nossa equipe pelo e-mail:
              <br />
              <strong className="text-slate-900">privacidade@centrofashion.com.br</strong>
            </p>
          </section>
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>© 2026 Centro Fashion Fortaleza. Todos os direitos reservados.</span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <Shield className="w-3.5 h-3.5 text-[#F50087]" />
            Em conformidade com as Políticas da Meta e LGPD
          </span>
        </div>
      </div>
    </div>
  );
};
