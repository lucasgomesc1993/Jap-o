# Sprint 1 — Fundação (Semanas 1–2)

**Objetivo:** Infraestrutura funcional, autenticação completa e landing page publicada.

---

## TASK 1.1 — Setup do Projeto

### 1.1.1 Inicializar Next.js 15 + TypeScript
- [x] Criar projeto com `npx create-next-app@latest` (App Router, TypeScript, ESLint)
- [x] Configurar `tsconfig.json` com `strict: true` e path aliases (`@/`)
- [x] Adicionar `.nvmrc` com versão Node LTS
- **Teste:** Verificar build limpo sem erros (`npm run build`)

### 1.1.2 Configurar ESLint + Prettier
- [x] Instalar `prettier`, `eslint-config-prettier`
- [x] Criar `.prettierrc` (singleQuote, semi, trailingComma)
- [x] Criar `.eslintrc.json` estendendo Next.js + Prettier
- [x] Adicionar scripts `lint` e `format` no `package.json`
- **Teste:** Rodar `npm run lint` sem warnings

### 1.1.3 Configurar ferramentas de teste
- [x] Instalar `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- [x] Instalar `msw` (Mock Service Worker) para mocks de API
- [x] Instalar `@playwright/test` para E2E
- [x] Criar `vitest.config.ts` com coverage provider `v8`
- [x] Configurar scripts: `test`, `test:watch`, `test:coverage`, `test:e2e`
- [x] Configurar threshold de coverage em 100%
- **Teste:** Rodar `npm run test` com teste placeholder passando

### 1.1.4 Configurar CI básico
- [x] Criar `.github/workflows/ci.yml` (lint + type-check + testes + coverage)
- [x] Garantir que PR só merga com coverage >= 100%
- **Teste:** Pipeline executa sem falhas

---

## TASK 1.2 — Configurar Supabase

### 1.2.1 Criar projeto Supabase
- [ ] Criar projeto no Supabase Dashboard
- [ ] Anotar `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Configurar Auth: habilitar email+senha, desabilitar outros providers
- [ ] Configurar confirmação de email obrigatória

### 1.2.2 Configurar clients Supabase
- [x] Instalar `@supabase/supabase-js`, `@supabase/ssr`
- [x] Criar `src/lib/supabase/server.ts` (server client)
- [x] Criar `src/lib/supabase/browser.ts` (browser client)
- [x] Criar `src/lib/supabase/middleware.ts` (middleware client)
- [x] Adicionar variáveis ao `.env.local` e `.env.example`
- **Testes unitários:**
  - [x] `server.ts` cria client com cookies corretos
  - [x] `browser.ts` cria client singleton
  - [x] Variáveis de ambiente são validadas (Zod)

### 1.2.3 Configurar Supabase Storage
- [x] Criar buckets: `product-photos`, `warehouse-photos`, `ticket-attachments`, `receipts`
- [x] Configurar políticas RLS por bucket
- [x] Configurar limites: 5MB, formatos JPG/PNG/WebP
- **Testes:**
  - [ ] Upload com tipo inválido é rejeitado
  - [ ] Upload acima de 5MB é rejeitado

---

## TASK 1.3 — Prisma + Schema Inicial

### 1.3.1 Configurar Prisma
- [x] Instalar `prisma`, `@prisma/client`
- [x] Inicializar com `npx prisma init`
- [x] Criar `src/lib/prisma/client.ts` (singleton pattern)
- **Teste:** Client conecta e executa query simples

### 1.3.2 Schema: User
- [x] Campos: `id` (UUID), `email`, `fullName`, `cpf` (criptografado), `phone`, `role` (CUSTOMER/ADMIN), `emailConfirmed`, `blocked`, timestamps
- [x] Índices: `email` (unique), `cpf` (unique)
- **Testes:**
  - [ ] Criar usuário com dados válidos
  - [ ] Rejeitar CPF/email duplicado
  - [ ] Enum role aceita apenas CUSTOMER e ADMIN

### 1.3.3 Schema: Address
- [x] Campos: `id`, `userId` (FK), `label`, `cep`, `street`, `number`, `complement`, `neighborhood`, `city`, `state`, `isDefault`, `createdAt`
- [x] Relação: User 1:N Address
- **Testes:**
  - [ ] Criar endereço vinculado a user
  - [ ] Cascade delete quando user é removido

### 1.3.4 Rodar migrations e seed
- [ ] Executar migration inicial
- [ ] Criar seed script com user admin + customer de teste
- **Teste:** Seed executa sem erros

---

## TASK 1.4 — Design System CSS

### 1.4.1 Tokens CSS (variáveis globais)
- [x] Criar `src/app/globals.css` com custom properties do DESIGN.md
- [x] Cores: todas as variáveis Material 3 (primary, surface, error, etc.)
- [x] Tipografia: importar Google Fonts (Cormorant Garamond + Jost)
- [x] Espaçamento, border radius, sombras, transições
- **Teste:** Snapshot test do CSS

### 1.4.2 Reset + Base styles
- [x] CSS reset (box-sizing, margin, font smoothing)
- [x] Estilos base para body, headings, links
- **Teste:** Renderizar página base sem erros

### 1.4.3 Utilitários CSS
- [x] Classes para layout, texto, espaçamento, visibilidade
- **Teste:** Cada classe aplica propriedade CSS esperada

---

## TASK 1.5 — Componentes UI Base

### 1.5.1 Button
- [x] Variantes: `primary`, `secondary`, `ghost`, `danger`
- [x] Tamanhos: `sm`, `md`, `lg` | Estados: `disabled`, `loading`
- **Testes:** renderização, variantes, loading spinner, disabled, acessibilidade

### 1.5.2 Input
- [x] Label, placeholder, helperText, errorMessage, ícone opcional
- [x] Borda crimson no focus
- **Testes:** renderização, erro, onChange, acessibilidade (aria-invalid)

### 1.5.3 Modal
- [x] Props: `isOpen`, `onClose`, `title`, `size`
- [x] Fecha com ESC e clique no overlay, focus trap
- **Testes:** renderização condicional, ESC, focus trap, aria-modal

### 1.5.4 Card
- [x] Borda 1px, radius 10px, sombra level 1, hover opcional
- **Testes:** renderização, hover class

### 1.5.5 Badge
- [x] Variantes: `info`, `success`, `warning`, `error`, `neutral`
- **Testes:** renderização, cor da variante

### 1.5.6 Sidebar
- [x] Largura 228px, barra crimson topo, item ativo com barra vertical
- [x] **Testes:** itens, item ativo, acessibilidade (nav, aria-current)

### 1.5.7 Skeleton / Loading
- [x] `SkeletonText`, `SkeletonCard`, `SkeletonTable` com shimmer
- [x] **Testes:** dimensões, aria-busy

### 1.5.8 Toast / Notification
- [x] Tipos: `success`, `error`, `warning`, `info` | Auto-dismiss | Zustand store
- [x] **Testes:** mensagem, auto-dismiss, empilhamento

---

## TASK 1.6 — Landing Page

### 1.6.1 Hero Section
- [x] Headline, subheadline, CTA "Começar agora", imagem, animação fade-in
- [x] **Testes:** renderização, CTA href correto

### 1.6.2 Seção "Como Funciona"
- [x] 4 steps visuais com ícones
- [x] **Testes:** renderiza 4 steps com título e descrição

### 1.6.3 Plataformas Aceitas
- [x] Grid de logos (dados do banco, configurável)
- [x] **Testes:** renderiza lista, fallback vazio

### 1.6.4 FAQ (Accordion)
- [x] Animação expandir/colapsar
- [x] **Testes:** toggle, aria-expanded

### 1.6.5 Footer
- [x] Links: Termos, Privacidade, Contato
- [x] **Teste:** renderiza todos os links

---

## TASK 1.7 — Calculadora de Frete (Landing)

- [x] Inputs: peso (g), dimensões (C×L×A), método de frete
- [x] Cálculo estimado por método (SAL, EMS, DHL, FedEx)
- [x] Sem login necessário
- **Testes:**
  - [x] Cálculo correto para cada método
  - [x] Validação de inputs (> 0)
  - [x] Exibe todos os métodos com valores

---

## TASK 1.8 — Cadastro

### 1.8.1 Formulário de cadastro
- [ ] React Hook Form + Zod | Máscaras CPF e telefone
- **Testes:** validação CPF, email, senha, submissão válida/inválida

### 1.8.2 Integração ViaCEP
- [ ] Busca automática ao preencher 8 dígitos
- **Testes:** CEP válido/inválido, loading state, mock MSW

### 1.8.3 Server Action de cadastro
- [ ] Validar com Zod, criar user no Supabase Auth + Prisma, criar address e wallet
- **Testes:** cadastro válido, CPF duplicado (409), email duplicado (409), dados inválidos (422)

---

## TASK 1.9 — Login + Logout + Middleware

### 1.9.1 Tela de login
- [ ] React Hook Form + Zod | Links esqueci senha e criar conta
- **Testes:** login válido/inválido, validação campos

### 1.9.2 Middleware de proteção
- [ ] Proteger `/dashboard/*` e `/admin/*` | Verificar role para admin | Verificar email confirmado (RN01)
- **Testes:** não autenticado→login, email não confirmado→confirmar, customer→admin blocked, admin ok

### 1.9.3 Logout
- [ ] Server Action invalida sessão, limpa cookies, redireciona
- **Teste:** após logout redireciona para login

---

## TASK 1.10 — Confirmação de Email

### 1.10.1 Página de confirmação pendente
- [ ] Mensagem, botão reenviar com cooldown 60s
- **Testes:** renderiza email, reenviar funciona, cooldown

### 1.10.2 Callback de confirmação
- [ ] Rota `/auth/callback`, atualiza Prisma, redireciona
- **Testes:** token válido/inválido

---

## TASK 1.11 — Layout Dashboard Cliente

### 1.11.1 Layout com Sidebar
- [ ] Sidebar fixa/drawer | Topbar com nome e logout | Itens: Pedidos, Armazém, Envios, Carteira, Suporte
- **Testes:** sidebar itens, topbar nome, navegação

### 1.11.2 Dashboard home
- [ ] Cards resumo (pedidos, armazém, envios, saldo) — valores zero
- **Testes:** renderiza 4 cards

---

## TASK 1.12 — Layout Painel Admin

### 1.12.1 Sidebar Admin
- [ ] Itens: Dashboard, Compras, Armazém, Expedição, Clientes, Financeiro, Configurações
- [ ] Role check no server component
- **Testes:** itens de nav, redirect se não admin

---

## TASK 1.13 — Deploy Vercel
- [ ] Conectar repo, configurar env vars, `vercel.json`, deploy preview
- **Teste:** site acessível sem erros

---

## TASK 1.14 — Resend + Email

### 1.14.1 Configurar Resend
- [ ] Client + helper `sendEmail`
- **Testes:** inicializa com API key, chama API corretamente (mock)

### 1.14.2 Template boas-vindas
- [ ] React Email com design NipponBox
- **Testes:** renderiza HTML válido, substitui variáveis

---

## Validators Zod — Sprint 1

Schemas com testes unitários completos (válido + cada tipo de inválido + mensagens pt-BR):
- [x] `cpf.schema.ts` | `cep.schema.ts` | `email.schema.ts`
- [x] `password.schema.ts` | `phone.schema.ts` | `address.schema.ts`
- [x] `user-register.schema.ts` | `login.schema.ts` | [x] `env.schema.ts`
