# Centro Fashion Fortaleza — Gestão Social & Meta App Review (Plano Final Etapa 1)

Sistema interno de gerenciamento de redes sociais (Facebook Pages e Instagram Professional) desenvolvido para o **Centro Fashion Fortaleza**, projetado para operação segura da equipe interna e estrita aderência aos critérios do **Meta App Review**.

---

## Decisões Confirmadas vs. Propostas Técnicas

### Decisões Efetivamente Confirmadas pelo Usuário
1. **Credenciais Meta**: O usuário já possui `App ID` e `App Secret` para cadastro seguro no painel.
2. **Persistência Inicial**: SQLite local no backend Express com criptografia simétrica para tokens e segredos.
3. **Escopo de Execução Atual**: Foco estrito na **Etapa 1 — Base Funcional** (login interno, perfis, auditoria estruturada, páginas regulatórias e painel de credenciais seguras), mantendo integrações de API real identificadas como pendentes até as próximas etapas.

### Propostas Técnicas Detalhadas
- **Política de Chave Ausente**: Nenhuma chave efêmera será gerada. Se `APP_ENCRYPTION_KEY` estiver ausente ou não possuir 32 bytes válidos, o backend bloqueia imediatamente o armazenamento e a descriptografia de segredos, emitindo alerta explicativo.
- **Divisão de Perfis de Usuário (RBAC)**:
  - `admin`: Controle total sobre colaboradores, credenciais da Meta e configurações.
  - `operator`: Operação cotidiana da equipe de marketing (publicações, comentários, atendimento, métricas), sem permissão de alterar credenciais ou usuários.
  - `reviewer`: Avaliador oficial da Meta. Acesso exclusivo aos ativos de teste homologados, com bloqueio estrito à visualização de segredos, configurações de produção e gestão de equipe.
- **Persistência Dev vs. App Review**: SQLite local com arquivo em `./data/centrofashion.db`. Foi documentada a estratégia de migração para banco externo gerenciado (ex.: Cloud SQL) caso a homologação do App Review exija multi-instâncias no Cloud Run.
- **Sanitização Estruturada**: Implementação de *allowlist* estrita de propriedades em payloads de auditoria, além de bloqueio de termos sensíveis.
- **Validação de Exclusão de Dados**: Validação matemática via HMAC-SHA256 do `signed_request` emitido pela Meta e exclusão efetiva dos registros do usuário no banco de dados.

---

## 1. Capacidades e Limitações do Ambiente

| Recurso do Ambiente | Status | Comprovação / Comportamento Técnico | Ação / Infraestrutura Complementar |
|---|---|---|---|
| **Backend Express** | Suportado | Express 4.21.2 executando via `tsx server.ts` em porta 3000, unificando API REST e frontend Vite. | Inicialização única com tratamento seguro de exceções. |
| **Persistência SQLite** | Suportado localmente | O arquivo de banco de dados `./data/centrofashion.db` persiste enquanto o contêiner estiver ativo. | Para instâncias efêmeras no Cloud Run, os dados persistem entre reinícios locais de processo. Para distribuição em múltiplas réplicas, indica-se Cloud SQL PostgreSQL. |
| **Armazenamento Seguro** | Suportado | Variáveis em `.env` lidas somente no servidor. Chave mestre `APP_ENCRYPTION_KEY` obrigatória para criptografia AES-256-GCM. | Bloqueio de gravação caso a chave mestre não esteja devidamente configurada no ambiente. |
| **URLs HTTPS Públicas** | Suportado | Endereço do ambiente disponível: `https://ais-dev-6t4lmur63ka7bvzouzpxtd-345197986569.us-west2.run.app`. | Rotas públicas derivadas dinamicamente do `APP_URL` ou `req.headers.host`. |
| **Gravação de Vídeo** | Manual orientada | Ambiente headless sem servidor X11 para gravação de tela automatizada. | Geração de roteiros de tela cronometrados com dados de teste para gravação manual pelo operador no OBS Studio ou gravador de tela. |

---

## 2. Matriz de Permissões da Meta (API v22.0 - Versão Configurável)

> **Fontes Oficiais Consultadas (13/10/2026)**:
> - Instagram API with Instagram Login: `https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login`
> - Instagram Graph API: `https://developers.facebook.com/docs/instagram-platform/instagram-graph-api`
> - Facebook Pages API: `https://developers.facebook.com/docs/pages-api`
> - Messenger Platform: `https://developers.facebook.com/docs/messenger-platform`
> - Meta Data Deletion Request Callback: `https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback`

### A. Fluxo Facebook Login

| Funcionalidade | Permissão Meta | Dependências | Host e Endpoint | Tipo de Token | Configuração Externa | Critério de Teste | Evidência em Vídeo | Fonte Oficial / Data |
|---|---|---|---|---|---|---|---|---|
| **Identificação da Página** | `pages_show_list`, `pages_read_engagement` | Papel de Admin na Página | `graph.facebook.com/{version}/me/accounts` | User Access Token | Produto "Facebook Login for Business" configurado | Retorno da Página com ID e nome | Login FB, concessão de permissão e exibição da Página Centro Fashion | `developers.facebook.com/docs/pages-api` (13/10/2026) |
| **Identificação Conta Instagram Vinculada** | `instagram_basic` | `pages_show_list`, Página vinculada ao IG | `graph.facebook.com/{version}/{page-id}?fields=instagram_business_account{id,username}` | Page Access Token | Conta Profissional do Centro Fashion vinculada à Página no Meta Business Suite | Retorno do ID profissional do Instagram | Exibição de `@centrofashionfor` com ID recuperado via Graph API | `developers.facebook.com/docs/instagram-platform/instagram-graph-api` (13/10/2026) |
| **Publicação na Página Facebook** | `pages_manage_posts` | `pages_show_list` | `POST graph.facebook.com/{version}/{page-id}/feed` | Page Access Token | Nível de acesso avançado aprovado para a Página | Post criado com `{ "id": "pageid_postid" }` | Envio de publicação de texto/foto no feed do Facebook | `developers.facebook.com/docs/pages-api` (13/10/2026) |
| **Publicação no Instagram (via FB Login)** | `instagram_content_publish` | `instagram_basic`, conta IG vinculada | `POST graph.facebook.com/{version}/{ig-user-id}/media`<br>`POST graph.facebook.com/{version}/{ig-user-id}/media_publish` | Page Access Token | URL pública HTTPS da imagem | Criação de contêiner e publicação com ID de mídia | Foto publicada no feed real do Instagram | `developers.facebook.com/docs/instagram-platform/instagram-graph-api/content-publishing` (13/10/2026) |
| **Comentários no Instagram (via FB Login)** | `instagram_manage_comments` | `instagram_basic` | `GET graph.facebook.com/{version}/{ig-media-id}/comments`<br>`POST graph.facebook.com/{version}/{comment-id}/replies` | Page Access Token | Post com comentários de teste | Resposta enviada com ID retornado | Comentário respondido no app oficial do Instagram | `developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-comment` (13/10/2026) |
| **Instagram Direct (via FB Login)** | `instagram_manage_messages` | `instagram_basic`, `pages_manage_metadata` | Webhook `messages` + `POST graph.facebook.com/{version}/{ig-user-id}/messages` | Page Access Token | Webhook `instagram` ativo no Meta Developers | Recepção de mensagem e réplica manual dentro de 24h | Mensagem do cliente recebida no painel e réplica no Direct | `developers.facebook.com/docs/messenger-platform/instagram/overview` (13/10/2026) |
| **Messenger da Página** | `pages_messaging` | `pages_manage_metadata` | Webhook `messages` + `POST graph.facebook.com/{version}/me/messages` | Page Access Token | Webhook `page` ativo no Meta Developers | Mensagem de chat recebida e respondida | Atendimento pelo chat da Página | `developers.facebook.com/docs/messenger-platform` (13/10/2026) |
| **Métricas do Instagram (via FB Login)** | `instagram_manage_insights` | `instagram_basic` | `GET graph.facebook.com/{version}/{ig-user-id}/insights?metric=reach,total_interactions&period=day` | Page Access Token | Dados acumulados na conta | Retorno dos indicadores oficiais | Consulta do período e exibição com carimbo de data | `developers.facebook.com/docs/instagram-platform/instagram-graph-api/insights` (13/10/2026) |

---

### B. Fluxo Instagram Login (Instagram API with Instagram Login)

| Funcionalidade | Permissão Meta | Dependências | Host e Endpoint | Tipo de Token | Configuração Externa | Critério de Teste | Evidência em Vídeo | Fonte Oficial / Data |
|---|---|---|---|---|---|---|---|---|
| **Identificação da Conta** | `instagram_business_basic` | Conta Instagram Profissional | `graph.instagram.com/{version}/me?fields=id,username,account_type` | Instagram User Access Token | Produto "Instagram" configurado com Redirect URI | Retorno do ID da conta sem necessidade de Página FB | Redirecionamento oficial, consentimento e dados básicos carregados | `developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login` (13/10/2026) |
| **Publicação no Instagram** | `instagram_business_content_publish` | `instagram_business_basic` | `POST graph.instagram.com/{version}/{ig-user-id}/media`<br>`POST graph.instagram.com/{version}/{ig-user-id}/media_publish` | Instagram User Access Token | URL pública HTTPS da imagem | Criação e publicação do contêiner nativo | Foto publicada no feed do Instagram via Instagram Login | `developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing` (13/10/2026) |
| **Comentários no Instagram** | `instagram_business_manage_comments` | `instagram_business_basic` | `GET graph.instagram.com/{version}/{ig-media-id}/comments`<br>`POST graph.instagram.com/{version}/{comment-id}/replies` | Instagram User Access Token | Post com comentários de teste | Listagem e resposta a comentários | Comentário respondido no app oficial | `developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/comments` (13/10/2026) |
| **Instagram Direct (via IG Login)** | `instagram_business_manage_messages` | `instagram_business_basic` | Webhook `instagram` + `POST graph.instagram.com/{version}/{ig-user-id}/messages` | Instagram User Access Token | Webhook `instagram` verificado no painel | Mensagem recebida e respondida dentro de 24h | DM respondida no app oficial do Instagram | `developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messages` (13/10/2026) |
| **Métricas de Mídia** | `instagram_business_basic` | Mídia existente | `GET graph.instagram.com/{version}/{ig-media-id}/insights?metric=reach,total_interactions` | Instagram User Access Token | Mídia com engajamento | Consulta de métricas reais da mídia | Métricas exibidas no painel com ID da mídia | `developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/insights` (13/10/2026) |

---

## 3. Arquitetura de Segurança, RBAC e Exclusão de Dados

### Controle de Acesso Baseado em Perfis (RBAC)
- `admin`:
  - Acesso à gestão de usuários internos (criação e alteração).
  - Configuração do App ID, App Secret e Webhook Token da Meta.
  - Visualização de logs completos.
- `operator`:
  - Operação social (postagens, moderação de comentários, atendimento SAC e consulta de métricas).
  - Bloqueio estrito à tela de configurações e dados de segredo.
- `reviewer`:
  - Perfil dedicado para o analista do Meta App Review.
  - Acesso liberado aos módulos submetidos e contas de teste homologadas.
  - Bloqueio estrito a: alteração de App Secret, criação de colaboradores e edição de dados de produção.

### Sanitização Estruturada de Auditoria
Payloads salvos no banco `audit_logs` sofrem desconstrução estruturada:
- Somente chaves permitidas em uma lista explícita (`id`, `name`, `username`, `timestamp`, `status`, `resource_id`, `http_status`, `endpoint`, `action`) são gravadas.
- Chaves como `access_token`, `app_secret`, `password`, `code`, `signed_request`, `secret` são totalmente descartadas.
- URLs registradas têm parâmetros de consulta (`?access_token=...`) purgados antes da gravação.

### Validação Criptográfica de Exclusão de Dados
O endpoint `/api/meta/data-deletion` implementa a especificação oficial da Meta:
1. Recebe `POST` com parâmetro `signed_request`.
2. Separa a assinatura HMAC e o payload codificado em Base64URL.
3. Computa o HMAC-SHA256 usando o `App Secret` real da Meta.
4. Se a assinatura for válida, extrai o `user_id`.
5. Executa a exclusão de todos os registros e tokens associados àquele `user_id` nas tabelas `social_accounts` e `audit_logs`.
6. Insere um registro na tabela `data_deletion_requests` com `confirmation_code` único e status `completed`.
7. Retorna a resposta JSON conforme padrão Meta:
   `{ "url": "https://[APP_URL]/exclusao-dados?code=[CONFIRMATION_CODE]", "confirmation_code": "[CONFIRMATION_CODE]" }`
8. A página `/exclusao-dados` permite ao usuário consultar o status da exclusão informando o código.

---

## 4. Roteiro e Critérios de Aceite da Etapa 1

### Entregáveis da Etapa 1:
1. **Servidor Full-Stack**: Express rodando na porta 3000, integrando endpoints `/api/*` e o aplicativo React.
2. **Banco SQLite Estruturado**: Tabelas `users`, `meta_config`, `social_accounts`, `audit_logs` e `data_deletion_requests`.
3. **Criptografia Real**: AES-256-GCM ativa quando `APP_ENCRYPTION_KEY` estiver presente. Bloqueio com alerta amigável caso a chave esteja ausente.
4. **Login e Sessões**: Autenticação com salt e hash PBKDF2, rate-limiting (máx. 5 tentativas), perfis `admin`, `operator` e `reviewer`.
5. **Configurações Meta**: Cadastro seguro do App ID e Secret (com exibição mascarada e versão da API configurável), exibindo todas as URLs públicas necessárias para o console da Meta.
6. **Módulos Sociais com Estado Pendente**: Contas, Publicações, Comentários, Atendimento e Métricas apresentados com estados visuais de pendência de conexão na Etapa 2.
7. **Páginas Regulatórias Públicas**: `/privacidade`, `/termos` e `/exclusao-dados` acessíveis sem necessidade de autenticação.
8. **Verificação de Persistência**: Validação de que os dados persistem após reinício do processo.
