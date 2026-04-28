# GEMINI.md — Guia do Projeto

## 1. Visão Geral do Projeto

Este é o **Nipponbox**, uma plataforma de *proxy shopping* e redirecionamento de compras do Japão para o Brasil. O sistema permite que usuários brasileiros comprem produtos em sites japoneses, armazenem no Japão e consolidem envios para o Brasil, pagando em Real via Pix.

Trata-se de um projeto web Fullstack construído com **Next.js 15 (App Router)**.

## 2. Tecnologias Principais (Stack)

*   **Frontend:** Next.js 15, React 19, TypeScript.
*   **Estilização:** CSS Modules (escopo por componente) e Vanilla CSS (variáveis globais). *Não utiliza Tailwind.*
*   **Formulários e Validação:** React Hook Form + Zod.
*   **Gerenciamento de Estado:** Zustand.
*   **Backend:** Next.js Server Actions e API Routes.
*   **Banco de Dados & ORM:** PostgreSQL (via Supabase) e Prisma ORM.
*   **Autenticação & Storage:** Supabase Auth e Supabase Storage.
*   **Pagamentos:** Integração com Mercado Pago (Pix).
*   **Emails:** Resend + React Email.
*   **Testes:** Vitest, Playwright e React Testing Library.

## 3. Comandos de Desenvolvimento

Os comandos disponíveis podem ser executados com o gerenciador de pacotes do projeto (ex: `npm` ou `pnpm`):

*   **Iniciar o servidor de desenvolvimento:** `npm run dev`
*   **Construir o projeto para produção:** `npm run build`
*   **Iniciar o servidor de produção:** `npm run start`
*   **Executar testes unitários:** `npm run test`
*   **Assistir testes:** `npm run test:watch`
*   **Gerar cobertura de testes:** `npm run test:coverage`
*   **Executar testes E2E:** `npm run test:e2e`
*   **Linting:** `npm run lint`
*   **Formatação de código:** `npm run format`

## 4. Convenções e Padrões de Código

*   **Nomenclatura:**
    *   Pastas e diretórios: `kebab-case` (ex: `meu-componente`).
    *   Componentes e arquivos de componentes: `PascalCase` (ex: `MeuComponente.tsx`).
    *   Sempre utilizar um componente por arquivo.
*   **Arquitetura:**
    *   `src/app/`: Contém as rotas da aplicação seguindo a estrutura do Next.js App Router (Landing, Auth, Dashboard do Cliente e Painel Admin).
    *   `src/components/`: Componentes visuais (`ui/`, `forms/`, `layout/`).
    *   `src/lib/`: Configurações de clientes (Prisma, Supabase, etc.) e utilitários.
*   **Validação:** O `Zod` deve ser utilizado em todas as fronteiras da aplicação (validação de formulários, inputs em API Routes e variáveis de ambiente).
*   **Acesso a Dados:** Utilizar o Prisma Client (`@prisma/client`) para consultas ao banco de dados sempre priorizando as tipagens geradas automaticamente.
*   **Commits:** O projeto adota a convenção de Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).
*   **Idioma de Comunicação do Agente:** Conforme as diretrizes globais, todas as documentações, interações, comentários no código e planos de implementação devem ser escritos em **Português Brasileiro (pt-BR)**.
