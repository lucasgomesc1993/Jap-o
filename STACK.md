# STACK.md — Definição Tecnológica

**Projeto:** Serviço de Compras e Redirecionamento JP → BR  
**Versão:** 1.0  
**Data:** Abril 2026  
**Deploy:** Vercel  

---

## 1. Visão da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      VERCEL                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Next.js 15 (App Router)              │  │
│  │  ┌─────────────┐  ┌────────────┐  ┌───────────┐  │  │
│  │  │  Landing     │  │  Dashboard │  │   Admin   │  │  │
│  │  │  (SSG/SSR)   │  │  (Cliente) │  │   Panel   │  │  │
│  │  └─────────────┘  └────────────┘  └───────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │         API Routes (Server Actions)         │  │  │
│  │  │   Pagamentos · Scraping · Webhooks · Cron   │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
          │            │            │            │
    ┌─────┴──┐   ┌─────┴──┐  ┌─────┴──┐  ┌─────┴──────┐
    │Supabase│   │Mercado │  │ Resend │  │  APIs      │
    │  Auth  │   │ Pago   │  │ Email  │  │ Externas   │
    │  DB    │   │  Pix   │  │        │  │ (Câmbio,   │
    │Storage │   │        │  │        │  │  ViaCEP,   │
    │Realtime│   │        │  │        │  │  Scraper)  │
    └────────┘   └────────┘  └────────┘  └────────────┘
```

---

## 2. Stack Detalhado

### 2.1 Frontend

| Tecnologia | Versão | Função |
|---|---|---|
| **Next.js** | 15.x | Framework fullstack — SSR, SSG, API Routes, Server Actions |
| **React** | 19.x | Biblioteca de UI |
| **TypeScript** | 5.x | Tipagem estática em todo o projeto |
| **CSS Modules** | nativo | Estilização com escopo por componente |
| **Vanilla CSS** | — | Design system global (tokens, utilitários, animações) |
| **React Hook Form** | 7.x | Formulários de alta performance (pedidos, cadastro, envios) |
| **Zod** | 3.x | Validação de schemas (CPF, CEP, URLs, formulários) |
| **Zustand** | 5.x | Gerenciamento de estado leve (carrinho, UI, notificações) |
| **date-fns** | 4.x | Formatação de datas (prazos, extrato, timestamps) |
| **Recharts** | 2.x | Gráficos para o painel admin (receita, KPIs) |
| **next-intl** | — | Preparação para i18n (pós-MVP, mas estrutura pronta) |

### 2.2 Backend / API

| Tecnologia | Função |
|---|---|
| **Next.js API Routes** | Endpoints REST para operações do sistema |
| **Next.js Server Actions** | Mutations server-side com tipagem (formulários, status) |
| **Supabase Edge Functions** | Tarefas assíncronas: cron jobs (câmbio diário, alertas de armazenamento, cobranças automáticas) |
| **Prisma** | ORM type-safe para Postgres — migrations, queries tipadas, relações |
| **Zod** | Validação de input em todas as API Routes |

> **💡 Por que Prisma + Supabase?** O Supabase fornece o Postgres e a infraestrutura. O Prisma adiciona tipagem forte no acesso ao banco, migrations versionadas e um workflow de desenvolvimento superior. As policies RLS do Supabase continuam ativas para segurança em camadas.

### 2.3 Banco de Dados

| Componente | Tecnologia |
|---|---|
| **SGBD** | PostgreSQL 15 (via Supabase) |
| **ORM** | Prisma |
| **Migrations** | Prisma Migrate (versionadas no repositório) |
| **RLS** | Supabase Row Level Security para acesso direto do cliente |
| **Backup** | Automático via Supabase (diário) |

**Entidades principais:**

```
User ──┬── Order ──── OrderItem
       │                 │
       ├── Wallet ───── Transaction
       │                 
       ├── Address
       │
       ├── Ticket ───── TicketMessage
       │
       └── Shipment ─── ShipmentItem
                            │
                      WarehouseItem
```

### 2.4 Autenticação

| Componente | Tecnologia |
|---|---|
| **Provider** | Supabase Auth |
| **Métodos** | Email + senha com confirmação obrigatória |
| **Middleware** | Next.js Middleware para proteção de rotas |
| **Sessão** | JWT via Supabase (httpOnly cookies) |
| **Roles** | `customer` e `admin` via custom claims no JWT |

> **⚠️ Importante:** O acesso ao dashboard é bloqueado até confirmação de email (RN01). O middleware do Next.js valida a sessão E o status de confirmação em cada request.

### 2.5 Pagamentos

| Componente | Tecnologia |
|---|---|
| **Gateway** | Mercado Pago |
| **Método MVP** | Pix (geração de QR Code via API) |
| **Webhook** | API Route dedicada para confirmação de pagamento |
| **Segurança** | Validação de assinatura do webhook, PCI DSS via gateway |

**Fluxo de pagamento (Pix):**

```
Cliente solicita pagamento
    → API Route gera cobrança no Mercado Pago
    → Retorna QR Code + código copia-e-cola
    → Cliente paga via banco
    → Webhook do Mercado Pago notifica API Route
    → API valida assinatura + atualiza status
    → Crédito na carteira OU confirmação do pedido
```

### 2.6 Armazenamento de Arquivos

| Componente | Tecnologia |
|---|---|
| **Storage** | Supabase Storage |
| **Buckets** | `product-photos`, `warehouse-photos`, `ticket-attachments`, `receipts` |
| **Políticas** | RLS — cliente vê só suas fotos; admin vê tudo |
| **Limites** | 5MB por imagem, formatos: JPG, PNG, WebP |
| **CDN** | Supabase CDN com transformações de imagem (thumbnail, resize) |

### 2.7 Email Transacional

| Componente | Tecnologia |
|---|---|
| **Provider** | Resend |
| **Templates** | React Email (componentes React para emails) |
| **Gatilhos** | Server Actions / Edge Functions disparam envios |

**Emails do MVP:**
- Confirmação de cadastro
- Pedido criado / comprado / item no armazém
- Alerta de prazo de armazenamento (7 dias antes)
- Código de rastreio disponível
- Resposta em chamado de suporte

### 2.8 Integrações Externas

| Integração | API | Frequência |
|---|---|---|
| **Cotação ¥/R$** | AwesomeAPI (`economia.awesomeapi.com.br`) | Cron diário via Edge Function |
| **CEP** | ViaCEP (`viacep.com.br`) | Sob demanda (cadastro/endereço) |
| **Scraping** | Cheerio + fetch (server-side) | Sob demanda (criação de pedido) |

> **⚠️ Risco:** O scraping é a integração de maior risco (bloqueios, mudanças de layout). O fallback manual SEMPRE estará disponível. O scraping roda server-side via API Route para evitar CORS e proteger a lógica.

---

## 3. Infraestrutura e Deploy

### 3.1 Vercel

| Recurso | Uso |
|---|---|
| **Hosting** | Frontend SSR/SSG + API Routes |
| **Edge Middleware** | Proteção de rotas, redirecionamentos |
| **Cron Jobs** | `vercel.json` cron para tarefas agendadas |
| **Environment Variables** | Chaves de API, connection strings |
| **Preview Deployments** | Branch-based para QA |

### 3.2 Supabase

| Recurso | Uso |
|---|---|
| **Database** | Postgres principal |
| **Auth** | Autenticação e autorização |
| **Storage** | Fotos e arquivos |
| **Edge Functions** | Cron jobs complementares |
| **Realtime** | Notificações internas do admin (opcional) |

### 3.3 Ambientes

| Ambiente | Finalidade |
|---|---|
| `development` | Local — Supabase local via CLI |
| `staging` | Branch de preview na Vercel + Supabase branch |
| `production` | Domínio principal + Supabase production |

---

## 4. Estrutura de Pastas

```
/
├── prisma/
│   └── schema.prisma          # Schema do banco
│   └── migrations/            # Migrations versionadas
│
├── src/
│   ├── app/
│   │   ├── (landing)/         # Landing page pública (SSG)
│   │   ├── (auth)/            # Login, cadastro, confirmação
│   │   ├── (dashboard)/       # Área do cliente (protegida)
│   │   │   ├── pedidos/
│   │   │   ├── armazem/
│   │   │   ├── envios/
│   │   │   ├── carteira/
│   │   │   └── suporte/
│   │   ├── (admin)/           # Painel administrativo (protegido + role admin)
│   │   │   ├── dashboard/
│   │   │   ├── compras/
│   │   │   ├── armazem/
│   │   │   ├── expedicao/
│   │   │   ├── clientes/
│   │   │   ├── financeiro/
│   │   │   └── configuracoes/
│   │   └── api/               # API Routes
│   │       ├── webhooks/
│   │       ├── payments/
│   │       └── scraper/
│   │
│   ├── components/
│   │   ├── ui/                # Componentes base (Button, Input, Modal, etc.)
│   │   ├── forms/             # Formulários reutilizáveis
│   │   ├── layout/            # Header, Sidebar, Footer
│   │   └── charts/            # Componentes de gráfico (admin)
│   │
│   ├── lib/
│   │   ├── supabase/          # Clients (server, browser, middleware)
│   │   ├── prisma/            # Prisma client singleton
│   │   ├── mercadopago/       # SDK e helpers de pagamento
│   │   ├── resend/            # Client de email
│   │   ├── validators/        # Schemas Zod (CPF, CEP, pedido, etc.)
│   │   └── utils/             # Helpers (formatação, câmbio, etc.)
│   │
│   ├── hooks/                 # Custom hooks React
│   ├── stores/                # Zustand stores
│   ├── types/                 # Tipos TypeScript globais
│   └── emails/                # Templates React Email
│
├── public/                    # Assets estáticos
├── supabase/
│   ├── functions/             # Edge Functions
│   └── migrations/            # Migrations SQL (RLS policies)
│
├── vercel.json                # Configuração de cron e rewrites
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Padrões e Convenções

| Aspecto | Convenção |
|---|---|
| **Componentes** | PascalCase, um componente por arquivo |
| **Arquivos** | kebab-case para pastas, PascalCase para componentes |
| **API Routes** | RESTful, versionamento implícito |
| **Commits** | Conventional Commits (`feat:`, `fix:`, `chore:`) |
| **Branch** | `main` (prod), `develop`, `feature/*`, `fix/*` |
| **Variáveis de ambiente** | Prefixo `NEXT_PUBLIC_` para client-side, sem prefixo para server-only |
| **Validação** | Zod em TODAS as fronteiras (API input, formulários, env vars) |
| **Erros** | Error boundaries no React, try/catch tipado no server |
| **Logging** | Estruturado (JSON) em produção, console em dev |

---

## 6. Segurança

| Camada | Implementação |
|---|---|
| **Autenticação** | Supabase Auth (JWT, httpOnly cookies) |
| **Autorização** | Middleware Next.js + RLS Supabase + role check server-side |
| **Dados sensíveis** | CPF/endereço criptografados em repouso (pgcrypto) |
| **Senhas** | bcrypt via Supabase Auth |
| **HTTPS** | Forçado pela Vercel |
| **CSRF** | Proteção nativa do Next.js (Server Actions) |
| **Rate Limiting** | Middleware na Vercel (rate limit por IP) |
| **Webhooks** | Validação de assinatura (HMAC) |
| **Uploads** | Validação de tipo MIME + tamanho no server |
| **LGPD** | Endpoint de exclusão de dados, política de privacidade, consentimento explícito |

---

## 7. Monitoramento

| Ferramenta | Função |
|---|---|
| **Vercel Analytics** | Performance web (Core Web Vitals) |
| **Vercel Logs** | Logs de API Routes e Edge Functions |
| **Supabase Dashboard** | Métricas de DB, Auth, Storage |
| **Sentry** (recomendado) | Error tracking em produção |
| **Uptime Robot** (free) | Monitoramento de disponibilidade |

---

*Este documento define a base tecnológica do projeto. Deve ser revisado junto ao SPRINT.md para priorização de implementação.*
