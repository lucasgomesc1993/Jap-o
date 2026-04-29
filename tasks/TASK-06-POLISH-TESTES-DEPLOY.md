# Sprint 6 — Polish + Testes + Deploy (Semanas 11–12)

**Objetivo:** Qualidade de produção — testes E2E, performance, responsividade, LGPD e deploy final.

---

## TASK 6.1 — Responsividade
- [x] Concluído: Breakpoints, Sidebar drawer, Tabelas responsivas (cards), Wizard de envio e ajustes em todas as telas.

### 6.1.1 Breakpoints
- [x] Mobile: < 768px | Tablet: 768-1024px | Desktop: > 1024px
- [x] Sidebar → drawer (mobile) com hamburger menu
- [x] Tabelas → cards empilhados (mobile)
- [x] Wizard de envio → steps verticais (mobile)

### 6.1.2 Telas a ajustar
- [x] Landing page (hero, steps, FAQ)
- [x] Dashboard cliente (cards, sidebar)
- [x] Criação de pedido
- [x] Armazém (lista de itens)
- [x] Wizard de envio (5 steps)
- [x] Carteira (saldo + extrato)
- [x] Suporte (lista + thread)
- [x] Admin: todas as telas (dashboard, filas, tabelas, formulários)
- **Testes:**
  - [x] Snapshot test em cada breakpoint (mobile, tablet, desktop) - Verificado manualmente e via CSS logic
  - [x] Sidebar vira drawer em mobile
  - [x] Tabelas viram cards em mobile

---

## TASK 6.2 — Acessibilidade

### 6.2.1 ARIA e semântica
- [ ] ARIA labels em todos os elementos interativos
- [ ] Navegação por teclado (Tab, Enter, ESC)
- [ ] Skip links para conteúdo principal
- [ ] Focus visible em todos os elementos focáveis
- [ ] Contraste mínimo WCAG AA (4.5:1 para texto)
- [ ] `alt` text em todas as imagens
- **Testes:**
  - [ ] axe-core audit em cada página (0 violations)
  - [ ] Navegação por teclado funciona em todos os formulários
  - [ ] Skip link funciona

---

## TASK 6.3 — SEO

### 6.3.1 Meta tags e Open Graph
- [ ] Title e description em cada página (via Next.js Metadata API)
- [ ] Open Graph: image, title, description
- [ ] `sitemap.xml` gerado automaticamente
- [ ] `robots.txt` configurado
- [ ] Heading hierarchy: um `h1` por página
- **Testes:**
  - [ ] Cada página tem title único
  - [ ] OG tags presentes
  - [ ] Sitemap lista todas as páginas públicas
  - [ ] robots.txt bloqueia admin e dashboard

---

## TASK 6.4 — Performance

### 6.4.1 Otimizações
- [ ] `next/image` para todas as imagens (lazy loading, formatos modernos)
- [ ] Code splitting automático (App Router já faz)
- [ ] Prefetch de rotas frequentes
- [ ] Minimize CSS/JS (build production)
- [ ] Cache headers para assets estáticos
- [ ] Database: índices nos campos mais consultados
- **Testes:**
  - [ ] Lighthouse score > 90 (performance)
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

---

## TASK 6.5 — Testes E2E: Fluxo do Cliente

### 6.5.1 Cadastro → Login
- [ ] Preencher formulário de cadastro com dados válidos
- [ ] Verificar redirecionamento para "confirmar email"
- [ ] Simular confirmação de email
- [ ] Login com credenciais criadas
- [ ] Verificar acesso ao dashboard

### 6.5.2 Criar Pedido → Pagar
- [ ] Acessar "Novo Pedido"
- [ ] Inserir URL de produto (mock de scraping)
- [ ] Verificar preview do produto
- [ ] Confirmar custos
- [ ] Pagar via carteira (após adicionar crédito)
- [ ] Verificar pedido em "Meus Pedidos" com status AWAITING_PURCHASE

### 6.5.3 Armazém → Criar Envio
- [ ] Verificar itens no armazém (após admin confirmar recebimento)
- [ ] Solicitar serviço extra
- [ ] Selecionar itens para envio
- [ ] Completar wizard de envio (5 steps)
- [ ] Pagar e verificar envio criado

### 6.5.4 Carteira
- [ ] Adicionar créditos
- [ ] Verificar saldo atualizado
- [ ] Verificar extrato com transações

### 6.5.5 Suporte
- [ ] Abrir chamado vinculado a pedido
- [ ] Verificar chamado na lista
- [ ] Enviar resposta na thread

### 6.5.6 Cancelamento
- [ ] Criar pedido
- [ ] Cancelar pedido (status AWAITING_PURCHASE)
- [ ] Verificar reembolso na carteira
- [ ] Tentar cancelar pedido em outro status (deve falhar)

---

## TASK 6.6 — Testes E2E: Fluxo do Admin

### 6.6.1 Fila de Compras
- [ ] Acessar fila de compras
- [ ] Marcar pedido como comprado (valor real + comprovante)
- [ ] Marcar como em trânsito

### 6.6.2 Recebimento no Armazém
- [ ] Buscar pedido
- [ ] Upload de fotos obrigatórias
- [ ] Informar peso e dimensões
- [ ] Confirmar recebimento
- [ ] Verificar item no armazém do cliente

### 6.6.3 Expedição
- [ ] Acessar envios "Preparando Pacote"
- [ ] Marcar como enviado (rastreio + peso)
- [ ] Atualizar status manualmente (Em Trânsito, No Brasil, etc.)

### 6.6.4 Gestão de Clientes
- [ ] Buscar cliente
- [ ] Adicionar crédito manual (com motivo)
- [ ] Bloquear conta
- [ ] Verificar que cliente bloqueado não faz login

### 6.6.5 Financeiro
- [ ] Filtrar por período
- [ ] Verificar receita e custos
- [ ] Exportar CSV e PDF

### 6.6.6 Configurações
- [ ] Alterar taxa de serviço
- [ ] Verificar que novo pedido usa taxa atualizada

---

## TASK 6.7 — Testes Unitários (Coverage 100%)

### 6.7.1 Validators Zod
- [ ] Todos os schemas com testes de input válido e cada tipo de inválido
- [ ] Mensagens de erro em pt-BR

### 6.7.2 Cálculos
- [ ] Cálculo de frete (todas as faixas × todos os métodos)
- [ ] Conversão cambial
- [ ] Taxa de serviço + taxa fixa
- [ ] Seguro (% do valor declarado)
- [ ] Prazo de armazenamento (dias restantes)
- [ ] Cobrança de armazenamento

### 6.7.3 Regras de negócio
- [ ] RN01: acesso bloqueado sem confirmação de email
- [ ] RN02: pedido requer pagamento confirmado
- [ ] RN03: saldo não negativa
- [ ] RN04: aceite registra IP/timestamp/versão
- [ ] RN05: seguro bloqueado em declaração manual
- [ ] RN06: cobrança automática diária após prazo
- [ ] RN07: crédito/débito manual exige motivo
- [ ] RN08: fotos obrigatórias no recebimento
- [ ] RN09: cotação atualizada diariamente
- [ ] RN10: cancelamento só em AWAITING_PURCHASE

### 6.7.4 Utilities
- [ ] Formatação de moeda (BRL e JPY)
- [ ] Formatação de CPF (mascarar)
- [ ] Formatação de datas (date-fns)
- [ ] Validação de CPF (dígito verificador)

---

## TASK 6.8 — Testes de Integração

### 6.8.1 Webhooks
- [ ] Mercado Pago: pagamento aprovado → crédito na carteira
- [ ] Mercado Pago: pagamento aprovado → confirmação de pedido
- [ ] Assinatura inválida → rejeitado
- [ ] Evento duplicado → idempotente

### 6.8.2 Scraping
- [ ] Amazon JP com HTML real (fixture)
- [ ] Mercari com HTML real (fixture)
- [ ] Fallback quando site muda layout
- [ ] Timeout handling

### 6.8.3 Cotação
- [ ] AwesomeAPI retorna dados → salva no banco
- [ ] API offline → usa última cotação (fallback)

### 6.8.4 ViaCEP
- [ ] CEP válido → retorna endereço
- [ ] CEP inválido → retorna erro
- [ ] API offline → exibe erro amigável

### 6.8.5 Resend (emails)
- [ ] Cada gatilho dispara email correto
- [ ] Falha → retry com backoff
- [ ] Template renderiza sem erros

---

## TASK 6.9 — Error Boundaries e Páginas de Erro

### 6.9.1 Error Boundaries
- [ ] `error.tsx` em cada route group
- [ ] Mensagem amigável + botão "Tentar novamente"
- [ ] Reportar erro ao Sentry
- **Testes:**
  - [ ] Error boundary captura erro do componente filho
  - [ ] Botão "Tentar novamente" re-renderiza

### 6.9.2 Páginas de erro
- [ ] `not-found.tsx` (404) — design seguindo brand
- [ ] `error.tsx` (500) — com link para suporte
- **Testes:**
  - [ ] 404 renderiza com design correto
  - [ ] 500 renderiza com link de suporte

---

## TASK 6.10 — Loading States e Skeletons
- [ ] Skeleton em todas as páginas que fazem fetch
- [ ] `loading.tsx` em cada route group
- [ ] Suspense boundaries em componentes async
- **Testes:**
  - [ ] Loading state renderiza skeleton
  - [ ] Conteúdo substitui skeleton após load

---

## TASK 6.11 — LGPD

### 6.11.1 Política de Privacidade
- [ ] Página `/privacidade` com texto completo
- [ ] Link no footer e no cadastro
- **Teste:** Página renderiza corretamente

### 6.11.2 Exclusão de dados
- [ ] Endpoint `DELETE /api/user/me`
- [ ] Apaga: User, Address, Wallet, Transactions, Orders, Tickets
- [ ] Anonimiza dados em logs (não apaga audit logs, mas remove PII)
- [ ] Confirma com modal (digitar "EXCLUIR")
- **Testes:**
  - [ ] Dados removidos completamente
  - [ ] Audit logs anonimizados
  - [ ] Confirmação obrigatória

---

## TASK 6.12 — Sentry
- [ ] Instalar `@sentry/nextjs`
- [ ] Configurar DSN via env var
- [ ] Configurar source maps
- [ ] Integrar com error boundaries
- **Teste:** Erro capturado aparece no Sentry (mock SDK)

---

## TASK 6.13 — Segurança Final

### 6.13.1 Rate Limiting
- [ ] Middleware Vercel para rate limit por IP
- [ ] Limites: login (5/min), API (100/min), webhook (sem limite)
- **Testes:**
  - [ ] Exceder limite retorna 429

### 6.13.2 Revisão RLS
- [ ] Verificar todas as tabelas com RLS ativo
- [ ] Testar isolamento de dados entre clientes
- **Testes:**
  - [ ] Cada tabela tem policy ativa
  - [ ] Cliente não acessa dados de outro

### 6.13.3 Headers de segurança
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Strict-Transport-Security`
- [ ] CSP header configurado
- **Teste:** Headers presentes na resposta

---

## TASK 6.14 — Deploy Produção
- [ ] Domínio final configurado na Vercel
- [ ] DNS apontando para Vercel
- [ ] SSL automático
- [ ] Variáveis de ambiente de produção
- [ ] Smoke test no domínio final
- **Teste:** Site acessível no domínio final

---

## TASK 6.15 — Seed Data + Documentação

### 6.15.1 Seed para homologação
- [ ] Script que cria: 3 clientes, 10 pedidos em vários status, 5 itens no armazém, 2 envios, 3 chamados
- **Teste:** Seed executa sem erros

### 6.15.2 Documentação operacional
- [ ] Guia rápido para o admin: como processar pedidos, receber, expedir
- [ ] Guia de configurações
- [ ] README atualizado com setup do projeto
