# Sprint 5 — Financeiro + Suporte + Notificações (Semanas 9–10)

**Objetivo:** Módulos financeiros, suporte e notificações completos.

---

## TASK 5.1 — Schema: Tickets

### 5.1.1 Schema Prisma
- [x] Ticket: `id`, `userId` (FK), `orderId` (FK nullable), `shipmentId` (FK nullable), `type` (ITEM_ISSUE, TRACKING, BILLING, OTHER), `subject`, `status` (OPEN, IN_REVIEW, RESOLVED), `createdAt`, `updatedAt`
- [x] TicketMessage: `id`, `ticketId` (FK), `authorId` (FK), `authorRole` (CUSTOMER/ADMIN), `content`, `attachments` (JSON array), `createdAt`
- [x] Migration + RLS (cliente vê só seus tickets)
- **Testes:**
  - [x] Criar ticket com dados válidos
  - [x] Mensagem vinculada ao ticket
  - [x] Enums corretos
  - [x] RLS isola dados

---

## TASK 5.2 — Suporte (Cliente)

### 5.2.1 Abertura de chamado
- [x] Formulário: tipo (select), assunto, mensagem, vincular pedido/envio (select opcional)
- [x] Upload de até 5 fotos (validação: tipo MIME + tamanho)
- [x] Salvar fotos no bucket `ticket-attachments`
- **Testes:**
  - [x] Criar chamado com todos os campos
  - [x] Upload de 5 fotos funciona
  - [x] 6ª foto rejeitada
  - [x] Tipo MIME inválido rejeitado
  - [x] Vínculo com pedido/envio opcional

### 5.2.2 Histórico de chamados
- [x] Lista com: assunto, tipo (badge), status (badge), data, pedido/envio vinculado
- [x] Filtro por status
- [x] Detalhes: thread de mensagens (chat-like)
- [x] Responder no thread (cliente)
- **Testes:**
  - [x] Renderiza chamados do usuário
  - [x] Thread exibe mensagens na ordem
  - [x] Resposta adiciona mensagem à thread
  - [x] Filtro por status funciona

---

## TASK 5.3 — Suporte (Admin)

### 5.3.1 Lista de chamados
- [x] Tabela: cliente, assunto, tipo, status, data, pedido/envio
- [x] Filtro por status + tipo + cliente
- [x] Badge com count de chamados OPEN (sidebar)
- **Testes:**
  - [x] Renderiza todos os chamados
  - [x] Filtros funcionam
  - [x] Count no sidebar atualiza

### 5.3.2 Detalhes + Resposta
- [x] Thread completa de mensagens
- [x] Formulário de resposta (texto + fotos)
- [x] Botões: "Marcar em Análise", "Marcar Resolvido"
- [x] Cada ação dispara notificação ao cliente
- [x] Log de auditoria
- **Testes:**
  - [x] Resposta cria mensagem com authorRole ADMIN
  - [x] Mudança de status notifica cliente
  - [x] Log de auditoria criado
  - [x] Email disparado (mock)

---

## TASK 5.4 — Admin: Gestão de Clientes

### 5.4.1 Lista de clientes
- [x] Tabela: nome, email, saldo carteira, qtd pedidos, qtd chamados, status (ativo/bloqueado)
- [x] Busca por nome ou email
- [x] Paginação server-side
- **Testes:**
  - [x] Renderiza todos os clientes
  - [x] Busca funciona
  - [x] Paginação funciona

### 5.4.2 Perfil do cliente
- [x] Dados cadastrais (nome, email, CPF mascarado, telefone)
- [x] Saldo da carteira
- [x] Histórico: pedidos, envios, chamados (tabs)
- [x] Aceites de declaração registrados
- **Testes:**
  - [x] Exibe dados corretos
  - [x] CPF mascarado (###.***.**#-##)
  - [x] Tabs navegam corretamente
  - [x] Aceites listados com IP/data

### 5.4.3 Crédito/Débito manual (RN07)
- [x] Formulário: tipo (crédito/débito), valor, motivo (obrigatório)
- [x] Atualiza saldo + cria transação MANUAL_CREDIT/MANUAL_DEBIT
- [x] Log de auditoria com motivo
- **Testes:**
  - [x] Crédito aumenta saldo
  - [x] Débito diminui saldo
  - [x] Débito não pode negativar (RN03)
  - [x] Motivo obrigatório (validação)
  - [x] Transação criada com tipo correto
  - [x] Log de auditoria inclui motivo

### 5.4.4 Bloquear conta
- [x] Toggle bloquear/desbloquear
- [x] Usuário bloqueado não consegue fazer login
- [x] Log de auditoria
- **Testes:**
  - [x] Flag `blocked` atualizada
  - [x] Middleware impede login de bloqueado
  - [x] Log criado

---

## TASK 5.5 — Admin: Financeiro

### 5.5.1 Receita por período
- [x] Filtro de data (início/fim)
- [x] Cards: taxas de serviço, margem de frete, serviços extras, armazenamento
- [x] Gráfico de barras (Recharts) — receita por categoria
- [x] Gráfico de linha — receita ao longo do tempo
- [x] Cálculos corretos por categoria
- [x] Filtro de data funciona
- [x] Gráficos renderizam com dados

### 5.5.2 Custos
- [x] Compras reais em ¥ (convertido R$)
- [x] Fretes reais pagos
- [x] Outros custos operacionais (input manual)
- [x] Lucro = Receita - Custos
- **Testes:**
  - [x] Conversão ¥ → R$ usa cotação correta
  - [x] Somatórios corretos
  - [x] Lucro calcula corretamente

### 5.5.3 Saldos em carteira (passivo)
- [x] Total de saldo de todos os clientes
- [x] Lista top 10 clientes por saldo
- **Testes:**
  - [x] Soma total correta
  - [x] Ordenação top 10

### 5.5.4 Exportar relatórios
- [x] CSV: dados tabulares (receita, custos, transações)
- [x] PDF: relatório formatado (usando jsPDF ou react-pdf)
- [x] Filtrado pelo mesmo período selecionado
- **Testes:**
  - [x] CSV gerado com dados corretos
  - [x] PDF gerado sem erros
  - [x] Filtro de período aplicado

---

## TASK 5.6 — Admin: Configurações

### 5.6.1 Taxas e preços
- [x] Taxa de serviço (%) + taxa fixa (R$)
- [x] Tabela de frete: método × faixa de peso → preço
- [x] Prazo de armazenamento gratuito (dias)
- [x] Valor cobrança por dia após prazo (R$)
- [x] Preços dos serviços extras (por tipo)
- [x] Salvar com validação
- **Testes:**
  - [x] Valores salvos corretamente
  - [x] Validação: % entre 0-100, valores >= 0
  - [x] Alteração reflete imediatamente nos cálculos

### 5.6.2 Conteúdo configurável
- [x] Plataformas aceitas (lista de domínios, add/remove)
- [x] Produtos proibidos (lista de texto, visível ao cliente na landing)
- [x] Texto dos termos de responsabilidade (declaração manual) — versionado
- **Testes:**
  - [x] Adicionar/remover plataforma
  - [x] Texto de termos gera nova versão ao salvar
  - [x] Lista de proibidos renderiza na landing

---

## TASK 5.7 — Cobrança Automática de Armazenamento

### 5.7.1 Edge Function / Cron Job
- [x] Executar diariamente
- [x] Buscar itens com prazo vencido e status AVAILABLE
- [x] Calcular dias após vencimento × valor diário (config)
- [x] Debitar carteira do cliente (se saldo disponível)
- [x] Criar transação STORAGE_FEE
- [x] Se saldo insuficiente: registrar débito pendente
- [x] Enviar notificação ao cliente (primeira cobrança + recorrente semanal)
- **Testes:**
  - [x] Cobrança calculada corretamente
  - [x] Debita carteira
  - [x] Não cobra itens dentro do prazo
  - [x] Não cobra itens já enviados
  - [x] Saldo insuficiente registra pendência
  - [x] Email de cobrança disparado
  - [x] Idempotente (não cobra duas vezes no mesmo dia)

---

## TASK 5.8 — Email Templates Completos

### 5.8.1 Templates React Email
- [ ] Confirmação de cadastro (welcome)
- [ ] Pedido criado
- [ ] Pedido comprado
- [ ] Item chegou no armazém
- [ ] Alerta prazo armazenamento (7 dias)
- [ ] Prazo vencido (cobrança)
- [ ] Envio criado e pago
- [ ] Código de rastreio disponível
- [ ] Resposta no chamado de suporte
- **Testes (cada template):**
  - [ ] Renderiza HTML válido
  - [ ] Substitui variáveis corretamente
  - [ ] Design segue brand NipponBox

### 5.8.2 Service de disparo
- [ ] `src/lib/resend/send-notification.ts`
- [ ] Função por gatilho: `notifyOrderCreated(order)`, `notifyItemArrived(item)`, etc.
- [ ] Retry com backoff em caso de falha
- **Testes:**
  - [ ] Cada função chama Resend com template correto
  - [ ] Retry funciona em falha (mock)

---

## Validators Zod — Sprint 5

- [ ] `ticket-create.schema.ts` — type, subject, content, attachments (max 5)
- [ ] `ticket-message.schema.ts` — content obrigatório
- [x] `manual-credit.schema.ts` — tipo, valor > 0, motivo obrigatório
- [x] `admin-config.schema.ts` — taxas, prazos, preços, domínios
- [x] `financial-filter.schema.ts` — dateFrom, dateTo

**Cada schema:** testes válido, inválido, mensagens pt-BR
