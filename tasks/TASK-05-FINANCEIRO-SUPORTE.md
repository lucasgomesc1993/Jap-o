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
- [ ] Tabela: cliente, assunto, tipo, status, data, pedido/envio
- [ ] Filtro por status + tipo + cliente
- [ ] Badge com count de chamados OPEN (sidebar)
- **Testes:**
  - [ ] Renderiza todos os chamados
  - [ ] Filtros funcionam
  - [ ] Count no sidebar atualiza

### 5.3.2 Detalhes + Resposta
- [ ] Thread completa de mensagens
- [ ] Formulário de resposta (texto + fotos)
- [ ] Botões: "Marcar em Análise", "Marcar Resolvido"
- [ ] Cada ação dispara notificação ao cliente
- [ ] Log de auditoria
- **Testes:**
  - [ ] Resposta cria mensagem com authorRole ADMIN
  - [ ] Mudança de status notifica cliente
  - [ ] Log de auditoria criado
  - [ ] Email disparado (mock)

---

## TASK 5.4 — Admin: Gestão de Clientes

### 5.4.1 Lista de clientes
- [ ] Tabela: nome, email, saldo carteira, qtd pedidos, qtd chamados, status (ativo/bloqueado)
- [ ] Busca por nome ou email
- [ ] Paginação server-side
- **Testes:**
  - [ ] Renderiza todos os clientes
  - [ ] Busca funciona
  - [ ] Paginação funciona

### 5.4.2 Perfil do cliente
- [ ] Dados cadastrais (nome, email, CPF mascarado, telefone)
- [ ] Saldo da carteira
- [ ] Histórico: pedidos, envios, chamados (tabs)
- [ ] Aceites de declaração registrados
- **Testes:**
  - [ ] Exibe dados corretos
  - [ ] CPF mascarado (###.***.**#-##)
  - [ ] Tabs navegam corretamente
  - [ ] Aceites listados com IP/data

### 5.4.3 Crédito/Débito manual (RN07)
- [ ] Formulário: tipo (crédito/débito), valor, motivo (obrigatório)
- [ ] Atualiza saldo + cria transação MANUAL_CREDIT/MANUAL_DEBIT
- [ ] Log de auditoria com motivo
- **Testes:**
  - [ ] Crédito aumenta saldo
  - [ ] Débito diminui saldo
  - [ ] Débito não pode negativar (RN03)
  - [ ] Motivo obrigatório (validação)
  - [ ] Transação criada com tipo correto
  - [ ] Log de auditoria inclui motivo

### 5.4.4 Bloquear conta
- [ ] Toggle bloquear/desbloquear
- [ ] Usuário bloqueado não consegue fazer login
- [ ] Log de auditoria
- **Testes:**
  - [ ] Flag `blocked` atualizada
  - [ ] Middleware impede login de bloqueado
  - [ ] Log criado

---

## TASK 5.5 — Admin: Financeiro

### 5.5.1 Receita por período
- [ ] Filtro de data (início/fim)
- [ ] Cards: taxas de serviço, margem de frete, serviços extras, armazenamento
- [ ] Gráfico de barras (Recharts) — receita por categoria
- [ ] Gráfico de linha — receita ao longo do tempo
- **Testes:**
  - [ ] Cálculos corretos por categoria
  - [ ] Filtro de data funciona
  - [ ] Gráficos renderizam com dados

### 5.5.2 Custos
- [ ] Compras reais em ¥ (convertido R$)
- [ ] Fretes reais pagos
- [ ] Outros custos operacionais (input manual)
- [ ] Lucro = Receita - Custos
- **Testes:**
  - [ ] Conversão ¥ → R$ usa cotação correta
  - [ ] Somatórios corretos
  - [ ] Lucro calcula corretamente

### 5.5.3 Saldos em carteira (passivo)
- [ ] Total de saldo de todos os clientes
- [ ] Lista top 10 clientes por saldo
- **Testes:**
  - [ ] Soma total correta
  - [ ] Ordenação top 10

### 5.5.4 Exportar relatórios
- [ ] CSV: dados tabulares (receita, custos, transações)
- [ ] PDF: relatório formatado (usando jsPDF ou react-pdf)
- [ ] Filtrado pelo mesmo período selecionado
- **Testes:**
  - [ ] CSV gerado com dados corretos
  - [ ] PDF gerado sem erros
  - [ ] Filtro de período aplicado

---

## TASK 5.6 — Admin: Configurações

### 5.6.1 Taxas e preços
- [ ] Taxa de serviço (%) + taxa fixa (R$)
- [ ] Tabela de frete: método × faixa de peso → preço
- [ ] Prazo de armazenamento gratuito (dias)
- [ ] Valor cobrança por dia após prazo (R$)
- [ ] Preços dos serviços extras (por tipo)
- [ ] Salvar com validação
- **Testes:**
  - [ ] Valores salvos corretamente
  - [ ] Validação: % entre 0-100, valores >= 0
  - [ ] Alteração reflete imediatamente nos cálculos

### 5.6.2 Conteúdo configurável
- [ ] Plataformas aceitas (lista de domínios, add/remove)
- [ ] Produtos proibidos (lista de texto, visível ao cliente na landing)
- [ ] Texto dos termos de responsabilidade (declaração manual) — versionado
- **Testes:**
  - [ ] Adicionar/remover plataforma
  - [ ] Texto de termos gera nova versão ao salvar
  - [ ] Lista de proibidos renderiza na landing

---

## TASK 5.7 — Cobrança Automática de Armazenamento

### 5.7.1 Edge Function / Cron Job
- [ ] Executar diariamente
- [ ] Buscar itens com prazo vencido e status AVAILABLE
- [ ] Calcular dias após vencimento × valor diário (config)
- [ ] Debitar carteira do cliente (se saldo disponível)
- [ ] Criar transação STORAGE_FEE
- [ ] Se saldo insuficiente: registrar débito pendente
- [ ] Enviar notificação ao cliente (primeira cobrança + recorrente semanal)
- **Testes:**
  - [ ] Cobrança calculada corretamente
  - [ ] Debita carteira
  - [ ] Não cobra itens dentro do prazo
  - [ ] Não cobra itens já enviados
  - [ ] Saldo insuficiente registra pendência
  - [ ] Email de cobrança disparado
  - [ ] Idempotente (não cobra duas vezes no mesmo dia)

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
- [ ] `manual-credit.schema.ts` — tipo, valor > 0, motivo obrigatório
- [ ] `admin-config.schema.ts` — taxas, prazos, preços, domínios
- [ ] `financial-filter.schema.ts` — dateFrom, dateTo

**Cada schema:** testes válido, inválido, mensagens pt-BR
