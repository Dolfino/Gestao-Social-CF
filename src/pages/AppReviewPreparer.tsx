import React, { useState } from 'react';
import { PermissionMatrixItem } from '../types.js';
import {
  FileCheck2,
  Video,
  ExternalLink,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  HelpCircle,
  PlayCircle,
  Copy,
  Check,
} from 'lucide-react';

export const AppReviewPreparer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'scripts' | 'checklist'>('matrix');
  const [flowFilter, setFlowFilter] = useState<'all' | 'Facebook Login' | 'Instagram Login'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const matrixItems: PermissionMatrixItem[] = [
    // 1. Facebook Login: Identificação de Página
    {
      id: 'fb_page_id',
      featureName: 'Identificação da Página Centro Fashion',
      flow: 'Facebook Login',
      permission: 'pages_show_list, pages_read_engagement',
      dependencies: 'Usuário administrador da Página no Meta Business Suite',
      hostEndpoint: 'graph.facebook.com/v22.0/me/accounts',
      tokenType: 'User Access Token (trocado para longa duração)',
      externalConfig: 'Produto "Facebook Login for Business" configurado com Redirect URI',
      testCriterion: 'Retorno com status 200 OK contendo a Página "Centro Fashion Fortaleza" com seu ID numérico',
      videoEvidence: 'Gravação do clique em Conectar Facebook, tela de consentimento e lista de páginas exibida',
      officialDocUrl: 'https://developers.facebook.com/docs/pages-api',
      consultationDate: '13/10/2026',
      status: 'Interface pronta',
    },
    // 2. Facebook Login: Identificação da Conta Profissional do Instagram Vinculada
    {
      id: 'fb_ig_linked',
      featureName: 'Identificação do Instagram Comercial Vinculado',
      flow: 'Facebook Login',
      permission: 'instagram_basic',
      dependencies: 'pages_show_list, Página vinculada ao Instagram no Meta Business Suite',
      hostEndpoint: 'graph.facebook.com/v22.0/{page-id}?fields=instagram_business_account{id,username}',
      tokenType: 'Page Access Token',
      externalConfig: 'Vínculo ativo entre Página do Centro Fashion e a conta @centrofashionfor',
      testCriterion: 'Retorno do objeto instagram_business_account contendo o ID numérico comercial do Instagram',
      videoEvidence: 'Exibição da conta do Instagram identificada automaticamente a partir da Página selecionada',
      officialDocUrl: 'https://developers.facebook.com/docs/instagram-platform/instagram-graph-api',
      consultationDate: '13/10/2026',
      status: 'Interface pronta',
    },
    // 3. Facebook Login: Publicação na Página do Facebook
    {
      id: 'fb_page_post',
      featureName: 'Publicação de Post no Feed da Página Facebook',
      flow: 'Facebook Login',
      permission: 'pages_manage_posts',
      dependencies: 'pages_show_list, pages_read_engagement',
      hostEndpoint: 'POST graph.facebook.com/v22.0/{page-id}/feed',
      tokenType: 'Page Access Token',
      externalConfig: 'Nível de acesso avançado aprovado para a Página',
      testCriterion: 'Criação do post retornando { "id": "pageid_postid" }',
      videoEvidence: 'Envio do texto/foto no painel e confirmação da postagem no feed público da Página no Facebook',
      officialDocUrl: 'https://developers.facebook.com/docs/pages-api/posts',
      consultationDate: '13/10/2026',
      status: 'Interface pronta',
    },
    // 4. Facebook Login: Publicação no Instagram
    {
      id: 'fb_ig_publish',
      featureName: 'Publicação de Foto no Instagram (via FB Login)',
      flow: 'Facebook Login',
      permission: 'instagram_content_publish',
      dependencies: 'instagram_basic, conta Instagram Profissional vinculada',
      hostEndpoint: 'POST graph.facebook.com/v22.0/{ig-user-id}/media e media_publish',
      tokenType: 'Page Access Token',
      externalConfig: 'Imagem hospedada em URL pública HTTPS válida',
      testCriterion: 'Criação do contêiner de mídia, checagem de status e publicação retornando o ID da mídia',
      videoEvidence: 'Upload de foto, inserção de legenda, envio e comprovação do post aberto no Instagram real',
      officialDocUrl: 'https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/content-publishing',
      consultationDate: '13/10/2026',
      status: 'Interface pronta',
    },
    // 5. Facebook Login: Comentários no Instagram
    {
      id: 'fb_ig_comments',
      featureName: 'Moderação de Comentários no Instagram (via FB Login)',
      flow: 'Facebook Login',
      permission: 'instagram_manage_comments',
      dependencies: 'instagram_basic',
      hostEndpoint: 'GET graph.facebook.com/v22.0/{ig-media-id}/comments e POST /{comment-id}/replies',
      tokenType: 'Page Access Token',
      externalConfig: 'Post com comentários reais de teste na conta',
      testCriterion: 'Listagem dos comentários do post e envio de réplica retornando o ID do novo comentário',
      videoEvidence: 'Leitura de comentário no painel, envio de resposta e comprovação da resposta no aplicativo Instagram',
      officialDocUrl: 'https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-comment',
      consultationDate: '13/10/2026',
      status: 'Interface pronta',
    },
    // 6. Facebook Login: Instagram Direct
    {
      id: 'fb_ig_direct',
      featureName: 'Atendimento Direct do Instagram (via FB Login)',
      flow: 'Facebook Login',
      permission: 'instagram_manage_messages',
      dependencies: 'instagram_basic, pages_manage_metadata',
      hostEndpoint: 'Webhook messages + POST graph.facebook.com/v22.0/{ig-user-id}/messages',
      tokenType: 'Page Access Token',
      externalConfig: 'Webhook instagram configurado com assinatura HMAC-SHA256 no painel Meta',
      testCriterion: 'Recepção de mensagem enviada pelo cliente e envio de réplica dentro de 24h',
      videoEvidence: 'Envio de DM pelo celular do cliente, notificação no painel e resposta recebida no celular',
      officialDocUrl: 'https://developers.facebook.com/docs/messenger-platform/instagram/overview',
      consultationDate: '13/10/2026',
      status: 'Interface pronta',
    },
    // 7. Facebook Login: Messenger da Página
    {
      id: 'fb_messenger',
      featureName: 'Atendimento Messenger da Página',
      flow: 'Facebook Login',
      permission: 'pages_messaging',
      dependencies: 'pages_manage_metadata',
      hostEndpoint: 'Webhook messages + POST graph.facebook.com/v22.0/me/messages',
      tokenType: 'Page Access Token',
      externalConfig: 'Webhook page ativo e verificado no painel Meta for Developers',
      testCriterion: 'Recebimento de evento de chat da Página e resposta manual enviada com sucesso',
      videoEvidence: 'Cliente envia mensagem no chat da Página, atendente responde pelo sistema e cliente visualiza',
      officialDocUrl: 'https://developers.facebook.com/docs/messenger-platform',
      consultationDate: '13/10/2026',
      status: 'Interface pronta',
    },
    // 8. Facebook Login: Métricas do Instagram
    {
      id: 'fb_ig_insights',
      featureName: 'Métricas da Conta Instagram (via FB Login)',
      flow: 'Facebook Login',
      permission: 'instagram_manage_insights',
      dependencies: 'instagram_basic',
      hostEndpoint: 'GET graph.facebook.com/v22.0/{ig-user-id}/insights?metric=reach,total_interactions&period=day',
      tokenType: 'Page Access Token',
      externalConfig: 'Conta profissional com dados de engajamento acumulados',
      testCriterion: 'Retorno de série temporal com reach e total_interactions com carimbos oficiais da API',
      videoEvidence: 'Seleção do período, chamada à Graph API e renderização dos gráficos com data e fonte',
      officialDocUrl: 'https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/insights',
      consultationDate: '13/10/2026',
      status: 'Interface pronta',
    },
    // 9. Instagram Login: Identificação Direta
    {
      id: 'ig_login_basic',
      featureName: 'Identificação da Conta (Instagram API with Instagram Login)',
      flow: 'Instagram Login',
      permission: 'instagram_business_basic',
      dependencies: 'Conta Instagram Creator ou Business',
      hostEndpoint: 'graph.instagram.com/v22.0/me?fields=id,username,account_type',
      tokenType: 'Instagram User Access Token (trocado para longa duração)',
      externalConfig: 'Produto Instagram configurado no portal Meta com Redirect URI cadastrada',
      testCriterion: 'Retorno com status 200 contendo o ID e username de @centrofashionfor sem vínculo com Página FB',
      videoEvidence: 'Clique em Conectar Instagram, diálogo de login do Instagram e perfil carregado no painel',
      officialDocUrl: 'https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login',
      consultationDate: '13/10/2026',
      status: 'Interface pronta',
    },
    // 10. Instagram Login: Publicação Direta
    {
      id: 'ig_login_publish',
      featureName: 'Publicação no Instagram (via Instagram Login)',
      flow: 'Instagram Login',
      permission: 'instagram_business_content_publish',
      dependencies: 'instagram_business_basic',
      hostEndpoint: 'POST graph.instagram.com/v22.0/{ig-user-id}/media e media_publish',
      tokenType: 'Instagram User Access Token',
      externalConfig: 'URL pública HTTPS de imagem de catálogo',
      testCriterion: 'Criação e publicação do contêiner via endpoint nativo graph.instagram.com',
      videoEvidence: 'Foto enviada pelo fluxo Instagram Login e verificação do link permanente retornado',
      officialDocUrl: 'https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing',
      consultationDate: '13/10/2026',
      status: 'Interface pronta',
    },
    // 11. Instagram Login: Comentários Diretos
    {
      id: 'ig_login_comments',
      featureName: 'Comentários no Instagram (via Instagram Login)',
      flow: 'Instagram Login',
      permission: 'instagram_business_manage_comments',
      dependencies: 'instagram_business_basic',
      hostEndpoint: 'GET graph.instagram.com/v22.0/{ig-media-id}/comments e POST /{comment-id}/replies',
      tokenType: 'Instagram User Access Token',
      externalConfig: 'Post com comentários para moderação',
      testCriterion: 'Leitura e resposta aos comentários pela API direta do Instagram',
      videoEvidence: 'Seleção do post no fluxo Instagram Login, resposta enviada e confirmação no app oficial',
      officialDocUrl: 'https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/comments',
      consultationDate: '13/10/2026',
      status: 'Interface pronta',
    },
    // 12. Instagram Login: Direct Direto
    {
      id: 'ig_login_direct',
      featureName: 'Direct do Instagram (via Instagram Login)',
      flow: 'Instagram Login',
      permission: 'instagram_business_manage_messages',
      dependencies: 'instagram_business_basic',
      hostEndpoint: 'Webhook instagram + POST graph.instagram.com/v22.0/{ig-user-id}/messages',
      tokenType: 'Instagram User Access Token',
      externalConfig: 'Webhook instagram verificado com verify token no painel Meta',
      testCriterion: 'Recebimento de evento Direct e envio de resposta de texto dentro de 24h',
      videoEvidence: 'DM enviada pelo cliente, notificação em tempo real no painel e resposta recebida no celular',
      officialDocUrl: 'https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messages',
      consultationDate: '13/10/2026',
      status: 'Interface pronta',
    },
    // 13. Instagram Login: Métricas de Mídia
    {
      id: 'ig_login_insights',
      featureName: 'Métricas de Mídia (via Instagram Login)',
      flow: 'Instagram Login',
      permission: 'instagram_business_basic',
      dependencies: 'Mídia existente com engajamento',
      hostEndpoint: 'GET graph.instagram.com/v22.0/{ig-media-id}/insights?metric=reach,total_interactions',
      tokenType: 'Instagram User Access Token',
      externalConfig: 'Mídia válida na conta',
      testCriterion: 'Consulta de alcance e interações totais retornadas pelo endpoint nativo do Instagram',
      videoEvidence: 'Exibição das métricas reais da mídia selecionada com rotulagem oficial da API',
      officialDocUrl: 'https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/insights',
      consultationDate: '13/10/2026',
      status: 'Interface pronta',
    },
  ];

  const filteredItems = matrixItems.filter((item) => {
    if (flowFilter === 'all') return true;
    return item.flow === flowFilter;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F50087]">
              Homologação Oficial
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Meta App Review</span>
          </div>
          <h1 className="text-xl font-bold text-[#171B68]">
            Preparador para o Meta App Review & Roteiros de Gravação
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Matriz de permissões atualizada, separação rigorosa entre Facebook Login e Instagram Login e roteiros minuto a minuto para gravação de tela.
          </p>
        </div>

        {/* Abas Superiores */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'matrix' ? 'bg-white text-[#171B68] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matriz de Permissões
          </button>
          <button
            onClick={() => setActiveTab('scripts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'scripts' ? 'bg-white text-[#171B68] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Roteiros de Vídeo
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'checklist' ? 'bg-white text-[#171B68] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diferenciação de Estados
          </button>
        </div>
      </div>

      {/* ABA 1: MATRIZ DE PERMISSÕES */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Filtro por Fluxo */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Layers className="w-4 h-4 text-[#F50087]" />
              <span>Filtrar por Fluxo de Autenticação:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFlowFilter('all')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                  flowFilter === 'all'
                    ? 'bg-[#171B68] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({matrixItems.length})
              </button>
              <button
                onClick={() => setFlowFilter('Facebook Login')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                  flowFilter === 'Facebook Login'
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Facebook Login (8)
              </button>
              <button
                onClick={() => setFlowFilter('Instagram Login')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                  flowFilter === 'Instagram Login'
                    ? 'bg-pink-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Instagram Login (5)
              </button>
            </div>
          </div>

          {/* Lista de Permissões em Cards Detalhados */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
              >
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        item.flow === 'Facebook Login'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {item.flow}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{item.featureName}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                      Estado: {item.status}
                    </span>
                    <a
                      href={item.officialDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#F50087] hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Docs Oficiais</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-500 font-semibold block">Permissão Meta Solicitada:</span>
                      <code className="bg-slate-100 text-[#171B68] px-2 py-0.5 rounded font-mono font-bold block mt-0.5">
                        {item.permission}
                      </code>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block">Dependências Verificadas:</span>
                      <span className="text-slate-800">{item.dependencies}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block">Host e Endpoint da API:</span>
                      <code className="bg-slate-50 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 font-mono block mt-0.5 break-all">
                        {item.hostEndpoint}
                      </code>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block">Tipo de Token de Acesso:</span>
                      <span className="font-mono text-slate-800">{item.tokenType}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-500 font-semibold block">Configuração Externa Exigida:</span>
                      <span className="text-slate-800">{item.externalConfig}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block">Critério de Teste e Aceite:</span>
                      <span className="text-slate-800">{item.testCriterion}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block">Evidência Exigida para Vídeo:</span>
                      <span className="text-slate-800">{item.videoEvidence}</span>
                    </div>

                    <div className="pt-1 text-[11px] text-slate-500">
                      Consulta oficial: {item.consultationDate}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 2: ROTEIROS DE GRAVAÇÃO */}
      {activeTab === 'scripts' && (
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-950">
              <Video className="w-5 h-5 text-[#F50087]" />
              Guia de Gravação de Tela Sem Cortes para o Meta App Review
            </div>
            <p>
              Grave vídeos separados para cada fluxo e funcionalidade. Nunca utilize montagens, animações simuladas ou aceleração de vídeo. Mantenha os dados sensíveis (senhas e tokens) fora da visão da tela.
            </p>
          </div>

          {/* Roteiro 1: Facebook Login */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-blue-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Roteiro 1: Conexão via Facebook Login</h3>
                <p className="text-xs text-blue-200">
                  Comprova: <code>pages_show_list</code>, <code>pages_read_engagement</code>, <code>instagram_basic</code>
                </p>
              </div>
              <span className="text-xs bg-blue-800 px-2 py-0.5 rounded font-mono">Duração: ~60s</span>
            </div>
            <div className="p-6 space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <strong>Abertura da Aplicação (0:00–0:10): </strong>
                  Abra o navegador no endereço público da aplicação, faça login com a conta de teste do avaliador (<code>reviewer@meta.com</code>).
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <strong>Navegação até Contas (0:10–0:20): </strong>
                  Clique no menu <em>Contas Conectadas</em> e clique no botão <em>Conectar via Facebook Login</em>.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <strong>Autorização Oficial da Meta (0:20–0:40): </strong>
                  Mostre a janela de diálogo oficial do Facebook (com a URL <code>facebook.com/dialog/oauth</code> visível na barra de endereços). Selecione a Página <em>Centro Fashion Fortaleza</em> e marque o consentimento das permissões.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold shrink-0">4</span>
                <div>
                  <strong>Comprovação no Painel (0:40–1:00): </strong>
                  Demonstre o retorno automático à aplicação com a Página conectada e a conta do Instagram vinculada exibida com ID numérico real recuperado pela API.
                </div>
              </div>
            </div>
          </div>

          {/* Roteiro 2: Instagram Login */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-pink-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Roteiro 2: Conexão via Instagram Login</h3>
                <p className="text-xs text-pink-200">
                  Comprova: <code>instagram_business_basic</code> (Instagram API with Instagram Login)
                </p>
              </div>
              <span className="text-xs bg-pink-700 px-2 py-0.5 rounded font-mono">Duração: ~45s</span>
            </div>
            <div className="p-6 space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-900 flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <strong>Abertura e Seleção (0:00–0:10): </strong>
                  No módulo <em>Contas Conectadas</em>, localize o bloco <em>Instagram API with Instagram Login</em> e clique em <em>Conectar Instagram</em>.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-900 flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <strong>Autorização Oficial do Instagram (0:10–0:30): </strong>
                  Demonstre a janela oficial do Instagram (<code>instagram.com/oauth/authorize</code>), autorizando o acesso básico à conta comercial.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-900 flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <strong>Comprovação Independente (0:30–0:45): </strong>
                  Exiba o perfil de <code>@centrofashionfor</code> carregado na aplicação com o badge oficial de <em>Instagram Login</em> (sem dependência de Página do Facebook).
                </div>
              </div>
            </div>
          </div>

          {/* Roteiro 3: Publicação no Instagram via Facebook Login (instagram_content_publish) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-indigo-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Roteiro 3: Publicação de Foto via Facebook Login</h3>
                <p className="text-xs text-indigo-200">
                  Comprova: <code>instagram_content_publish</code> (Instagram Graph API vinculada à Página)
                </p>
              </div>
              <span className="text-xs bg-indigo-800 px-2 py-0.5 rounded font-mono">Duração: ~75s</span>
            </div>
            <div className="p-6 space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <strong>Acesso ao Módulo de Publicações (0:00–0:15): </strong>
                  No menu lateral, navegue até <em>Publicações (Etapa 3)</em>. Demonstre o painel exibindo o <strong>Fluxo A (via Facebook Login)</strong> selecionado com o Instagram vinculado (ID: <code>17841402211050731</code>).
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <strong>Seleção da Imagem e Validação (0:15–0:30): </strong>
                  Selecione uma foto de vitrine (ou faça upload de arquivo próprio). Destaque os badges de validação técnica da Meta visíveis em tela (formato JPEG/PNG, proporção 1:1 e tamanho dentro de 8 MB).
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <strong>Redação da Legenda e Hashtags (0:30–0:45): </strong>
                  Digite a legenda de divulgação da coleção no editor e clique nas hashtags do Centro Fashion (<code>#CentroFashionFortaleza #ModaAtacado</code>), mostrando o contador de caracteres e tags.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold shrink-0">4</span>
                <div>
                  <strong>Prévia e Confirmação Explícita (0:45–1:00): </strong>
                  Apresente a <em>Prévia Aproximada (Instagram Feed)</em> com layout simulado. Clique em <em>Avançar para Confirmação</em> e mostre o modal de conferência com os dados de destino e chave de idempotência.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold shrink-0">5</span>
                <div>
                  <strong>Disparo e Comprovação no Instagram (1:00–1:15): </strong>
                  Clique em <em>Confirmar e Publicar Agora</em>. Exiba a criação do contêiner e o retorno do ID de mídia publicado. Clique no botão <em>Ver no Instagram</em> e mostre o post publicado ao vivo na conta <code>@centrofashionfor</code>.
                </div>
              </div>
            </div>
          </div>

          {/* Roteiro 4: Publicação no Instagram via Instagram Login (instagram_business_content_publish) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-[#F50087] to-[#7928CA] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Roteiro 4: Publicação de Foto via Instagram Login</h3>
                <p className="text-xs text-pink-100">
                  Comprova: <code>instagram_business_content_publish</code> (Instagram API with Instagram Login)
                </p>
              </div>
              <span className="text-xs bg-black/20 px-2 py-0.5 rounded font-mono">Duração: ~65s</span>
            </div>
            <div className="p-6 space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-900 flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <strong>Seleção do Fluxo Nativo (0:00–0:15): </strong>
                  No módulo <em>Publicações</em>, selecione o card <strong>Fluxo B: via Instagram Login</strong>. Destaque o ID da conta profissional (<code>28311044841920160</code>) sem intermediação de Página do Facebook.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-900 flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <strong>Upload da Imagem e Legenda (0:15–0:35): </strong>
                  Selecione a foto da vitrine e configure a legenda com as informações promocionais da loja atacado do Centro Fashion Fortaleza.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-900 flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <strong>Confirmação e Criação do Contêiner (0:35–0:50): </strong>
                  Clique em <em>Avançar para Confirmação</em>. Valide o resumo de destino e confirme o disparo para criação do contêiner nativo no host <code>graph.instagram.com</code>.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-900 flex items-center justify-center font-bold shrink-0">4</span>
                <div>
                  <strong>Publicação e Verificação Externa (0:50–1:05): </strong>
                  Acompanhe a conclusão da publicação com o ID gerado e o permalink direto. Abra o link do Instagram para comprovar a foto no feed da conta oficial.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: DIFERENCIAÇÃO RIGOROSA DE ESTADOS */}
      {activeTab === 'checklist' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4 text-xs text-slate-700">
          <h2 className="text-sm font-bold text-[#171B68] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#F50087]" />
            Diferenciação Estrita de Estados de Conclusão
          </h2>
          <p className="text-slate-600">
            Para garantir total conformidade com a auditoria da Meta e evitar declarações inverídicas, a equipe do Centro Fashion adota 5 estados inconfundíveis:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="font-bold text-slate-900">1. Interface Pronta</div>
              <p className="text-[11px] text-slate-500">
                Telas desenhadas, botões e formulários posicionados. <strong>Não comprova funcionamento da API.</strong>
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
              <div className="font-bold text-blue-900">2. Integração Validada</div>
              <p className="text-[11px] text-blue-700">
                Requisição HTTP 200 OK executada contra a Graph API oficial com ID real retornado e logado na auditoria.
              </p>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg space-y-1">
              <div className="font-bold text-indigo-900">3. Vídeo Gravado</div>
              <p className="text-[11px] text-indigo-700">
                Captura real de tela sem cortes executando o fluxo completo de autorização e resultado visível.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
              <div className="font-bold text-amber-900">4. Teste Reconhecido no Painel</div>
              <p className="text-[11px] text-amber-700">
                Status e indicador de teste observado diretamente no painel de desenvolvedores da Meta.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
              <div className="font-bold text-emerald-900">5. Permissão Aprovada</div>
              <p className="text-[11px] text-emerald-700">
                Decisão oficial favorável emitida pela equipe do Meta App Review no painel de submissão.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
