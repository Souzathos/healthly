# Healthly — Backlog Técnico de Funcionalidades

Backlog dos Requisitos Funcionais (RF) do artigo que ainda valem implementar, ordenados por
dependência técnica. Referência de status: ver a análise RF/RNF do projeto.

**Padrão dos models** (seguir em qualquer entidade nova, espelhando `backend/src/models`):
classe simples (sem `BaseEntity`), `@Entity('nome_plural')`, `@PrimaryGeneratedColumn() id: number`,
`@CreateDateColumn() createdAt: Date` (não há `updatedAt` no projeto), `length` explícito em
strings, relações sempre com inverse-side + `{ onDelete: 'CASCADE' }`, `@Unique([...])` em tabelas
de junção, mídia como `@Column({ type: 'longblob' }) data: Buffer`. Schema é code-first com TypeORM
`synchronize: true` — não há migrations; colunas/entidades novas sincronizam automaticamente.

---

## Fase 0 — Wire-up (backend pronto, falta apenas frontend) — ✅ IMPLEMENTADO NESTA PASSADA

Sem entidades novas; apenas ligação do frontend a endpoints existentes + pequenos ajustes de
leitura no backend (flags `likedByMe`/`savedByMe`, endpoint de posts curtidos).

- **RF03 — Curtir** → `POST /like/post/:postId` ligado em `PostCard`/`PostDetailPage` (otimista).
- **RF03 — Comentar** → `GET /comment/post/:postId` + `POST /comment/:postId` em `PostDetailPage`.
- **RF20 — Salvar** (`SavedPost`) → `POST /saved/:postId` + `GET /saved`, com aba "Salvos" no perfil.
- **Perfil** → abas Posts / Curtidas / Salvos (`GET /post/liked/:userId`, `GET /saved`).

Ainda em wire-up pendente (backend pronto, não ligado): **RF14 — Seguir** (`POST /follow/:userId`,
`GET /follow/:userId/followers|following`). O botão "Seguir" do perfil segue como estado local.

---

## Fase 1 — Verificação profissional (RF06 → RF12 → RF09)

Ordem obrigatória: o selo (RF06) e o comprovante (RF12) precisam existir antes do fluxo de
aprovação pelo admin (RF09).

### RF06 — Profissionais verificados (selo)
Colunas novas em `User` (`backend/src/models/User.ts`):
- `@Column({ default: false }) isVerified: boolean`
- `@Column({ default: 'user', length: 20 }) role: string`  // 'user' | 'professional' | 'admin'
- `@Column({ nullable: true, length: 20 }) professionalType: string`  // 'nutricionista' | 'educador_fisico'

Frontend: usar o já existente `VerifiedBadge.jsx` (hoje não referenciado) ao lado do nome quando
`user.isVerified`.

### RF12 — Upload de comprovante profissional (CRN/CREF)
Nova entidade `ProfessionalRequest` (`professional_requests`):
- `@Column({ type: 'longblob' }) documentData: Buffer`
- `@Column({ length: 100 }) mimeType: string`
- `@Column({ length: 30 }) registrationNumber: string`  // nº CRN/CREF
- `@Column({ default: 'pending', length: 20 }) status: string`  // 'pending' | 'approved' | 'rejected'
- `@ManyToOne(() => User, { onDelete: 'CASCADE' }) user: User`
- `@CreateDateColumn() createdAt: Date`

Reusar o padrão de upload de `PostService.create` (multer memory + longblob) e a rota de servir
binário (`GET /post/media/:mediaId`) como referência para servir o documento ao admin.

### RF09 — Administração da plataforma
- `role: 'admin'` + `adminMiddleware` (checa `req.user` → carrega `User` → exige `role === 'admin'`).
- Rotas admin: listar `ProfessionalRequest` pendentes, aprovar (seta `user.isVerified = true`,
  `role = 'professional'`) / rejeitar; moderar/remover posts e usuários.
- Depende de RF06 (role/isVerified) e RF12 (requests).

---

## Fase 2 — Descoberta (RF19 → RF08 → RF18)

### RF19 — Hashtags (persistidas)
Hoje as hashtags são só extraídas por regex do texto no frontend. Persistir:
- `Hashtag` (`hashtags`): `@Column({ unique: true, length: 100 }) tag: string`, `@CreateDateColumn`.
- `PostHashtag` (`post_hashtags`), junção: `@ManyToOne Post`, `@ManyToOne Hashtag`,
  `@Unique(['post', 'hashtag'])`.
- Popular no `create`/`update` de `PostService` a partir do texto.

### RF08 — Pesquisa e filtragem
- Sem entidade nova; endpoints com QueryBuilder: usuários por `handle`/`name`; posts por hashtag.
- Ligar a `SearchPage` (hoje mock) aos novos endpoints.

### RF18 — Filtrar por dieta
- `@Column({ nullable: true, length: 50 }) diet: string` em `Post` (ou entidade `Diet` + relação
  se quiser lista fixa). Filtro aplicado no feed/busca. Depende de RF19/RF08.

---

## Fase 3 — Stories (RF10 / RF13) — bloco independente

Hoje `StoryRow.jsx` é mock. Backend:
- `Story` (`stories`): `@Column({ type: 'longblob' }) data: Buffer`, `@Column({ length: 100 }) mimeType`,
  `@ManyToOne(() => User, { onDelete: 'CASCADE' }) user`, `@Column() expiresAt: Date` (24h após criação),
  `@CreateDateColumn`.
- Opcional `StoryView` (`story_views`): `@ManyToOne Story`, `@ManyToOne User`, `@Unique(['story','user'])`
  para "visto por".
- Endpoints: criar story (multer), listar stories ativos (`expiresAt > now`) dos seguidos.

---

## Fase 4 — Mensagens diretas (RF11) — bloco independente

- `Conversation` (`conversations`): dois participantes — `@ManyToOne User userA`, `@ManyToOne User userB`
  (ou junção `ConversationParticipant` se for evoluir para grupos), `@CreateDateColumn`.
- `Message` (`messages`): `@Column({ length: 1000 }) text`, `@ManyToOne Conversation`,
  `@ManyToOne User sender`, `@Column({ default: false }) read: boolean`, `@CreateDateColumn`.
- **Atenção:** os itens de tempo real do RF11 (status online, contador de não lidas ao vivo,
  timestamps em tempo real) exigem WebSocket — fora do padrão REST atual. Sinalizar como esforço
  extra (ex.: `socket.io`), ou entregar v1 só com polling.

---

## Fase 5 — Depois

### RF07 — Notificações / RF16 — Configurar alertas
- `Notification` (`notifications`): `@Column({ length: 30 }) type` (like | comment | follow),
  `@Column({ default: false }) read: boolean`, `@ManyToOne User recipient`,
  `@ManyToOne(() => User) actor` (nullable), referência ao alvo (postId, etc.), `@CreateDateColumn`.
- Gerar notificação nos toggles de like/comment/follow existentes.
- RF16: colunas de preferência de alerta no `User` (ex.: `notifyLikes`, `notifyComments` booleans).
- Ligar `NotificationsPage` (hoje mock) aos endpoints.

### RF05 — Acompanhamento de progresso
- `ProgressEntry` (`progress_entries`): `@Column('float') weight`, `@Column() date: Date`,
  outras métricas, `@ManyToOne User`, `@CreateDateColumn`.
- **LGPD (RNF04):** peso/evolução física são dados sensíveis de saúde — avaliar criptografia em
  repouso e consentimento explícito antes de implementar.

### RF17 — Recomendação por algoritmo
- Evolução do feed atual (hoje cronológico: seguidos + próprio). Peso extra para posts de
  verificados + afinidade com o `goal`/histórico do usuário. Sem entidade nova obrigatória.

### RF15 — Compartilhar / repost
- Entidade `Repost` (`reposts`): `@ManyToOne User`, `@ManyToOne Post`, `@Unique(['user','post'])`,
  `@CreateDateColumn`. Incluir reposts no feed. (No artigo, "estende curtir".)
