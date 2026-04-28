# Sprint 4 — Admin Core (Semanas 7–8)

**Objetivo:** Painel administrativo funcional para operação diária.

---

## TASK 4.1 — Dashboard Admin

### 4.1.1 KPI Cards
- [x] Pedidos aguardando compra (count)
- [x] Itens no armazém (count)
- [x] Envios prontos para despacho (count)
- [x] Chamados abertos (count)
- [x] Receita do mês (sum)
- [x] Queries otimizadas (Prisma aggregates)
- **Testes:**
  - [x] Renderiza 5 KPI cards
  - [x] Valores calculados corretamente
  - [x] Loading state com skeletons

### 4.1.2 Alertas
- [x] Prazos de armazenamento vencendo (< 7 dias)
- [x] Pagamentos pendentes de confirmação
- [x] Lista com link para o item/pedido
- **Testes:**
  - [x] Alerta aparece para itens com prazo < 7 dias
  - [x] Link direciona corretamente
  - [x] Sem alertas = mensagem "Tudo em dia"

---

## TASK 4.2 — Fila de Compras (Admin)

### 4.2.1 Lista de pedidos pendentes
- [ ] Tabela: cliente, produto (link), variação, observações, valor cobrado, data
- [ ] Ordenação por data (mais antigo primeiro)
- [ ] Busca por nome do cliente ou produto
- **Testes:**
  - [ ] Renderiza apenas pedidos AWAITING_PURCHASE
  - [ ] Ordenação correta
  - [ ] Busca filtra resultados

### 4.2.2 Ação "Marcar como Comprado"
- [ ] Modal com: valor real pago em ¥, previsão de chegada, upload de comprovante
- [ ] Atualiza status para PURCHASED
- [ ] Registra valor real vs cobrado (para controle financeiro)
- [ ] Upload do comprovante ao bucket `receipts`
- [ ] Log de auditoria
- **Testes:**
  - [ ] Status atualizado para PURCHASED
  - [ ] Valor real registrado
  - [ ] Comprovante salvo no storage
  - [ ] Log de auditoria criado (userId + timestamp + ação)
  - [ ] Campos obrigatórios validados

### 4.2.3 Ação "Marcar Em Trânsito para Armazém"
- [ ] Botão direto na lista após "Comprado"
- [ ] Atualiza status para IN_TRANSIT_TO_WAREHOUSE
- [ ] Log de auditoria
- **Testes:**
  - [ ] Só funciona em pedidos PURCHASED
  - [ ] Log criado

---

## TASK 4.3 — Recebimento no Armazém (Admin)

### 4.3.1 Busca de pedido
- [ ] Busca por nome, código ou cliente
- [ ] Filtrar pedidos IN_TRANSIT_TO_WAREHOUSE
- **Testes:**
  - [ ] Busca encontra pedido por nome/código/cliente
  - [ ] Filtra apenas status correto

### 4.3.2 Formulário de recebimento
- [ ] Upload obrigatório de 2-3 fotos (RN08)
- [ ] Informar peso real (g) e dimensões (cm × cm × cm)
- [ ] Se Quality Check solicitado: resultado (OK/Problema) + foto se problema
- [ ] Botão "Confirmar Recebimento"
- **Testes:**
  - [ ] Rejeita se < 2 fotos
  - [ ] Aceita 2-3 fotos
  - [ ] Peso e dimensões obrigatórios (> 0)
  - [ ] Quality Check: resultado obrigatório se solicitado
  - [ ] Foto de problema obrigatória se resultado = Problema

### 4.3.3 Server Action: confirmar recebimento
- [ ] Atualizar status do pedido para IN_WAREHOUSE
- [ ] Criar WarehouseItem com fotos, peso, dimensões
- [ ] Calcular freeStorageDeadline (config dias + arrivedAt)
- [ ] Enviar notificação ao cliente (email + push)
- [ ] Log de auditoria
- **Testes:**
  - [ ] Pedido atualizado para IN_WAREHOUSE
  - [ ] WarehouseItem criado com dados corretos
  - [ ] Deadline calculado corretamente
  - [ ] Email disparado (mock Resend)
  - [ ] Log de auditoria criado

---

## TASK 4.4 — Expedição (Admin)

### 4.4.1 Lista de envios "Preparando Pacote"
- [ ] Tabela: cliente, itens, método, valor declarado, endereço
- [ ] Flag visual ⚠️ para declaração manual
- **Testes:**
  - [ ] Renderiza apenas status PREPARING
  - [ ] Flag para declaração manual visível
  - [ ] Dados completos exibidos

### 4.4.2 Ação "Marcar como Enviado"
- [ ] Modal: código de rastreio (obrigatório), peso final real
- [ ] Atualiza status para SHIPPED
- [ ] Envia notificação com código de rastreio ao cliente
- [ ] Log de auditoria
- **Testes:**
  - [ ] Rastreio obrigatório (validação)
  - [ ] Status atualizado para SHIPPED
  - [ ] Email com rastreio disparado
  - [ ] Log criado

### 4.4.3 Atualização manual de status
- [ ] Dropdown: IN_TRANSIT, IN_BRAZIL, OUT_FOR_DELIVERY
- [ ] Cada mudança notifica o cliente
- [ ] Log de auditoria
- **Testes:**
  - [ ] Transição de status válida (não pode pular estados)
  - [ ] Notificação em cada mudança
  - [ ] Log para cada ação

---

## TASK 4.5 — Gestão do Armazém (Admin)

### 4.5.1 Visão geral de todos os itens
- [ ] Tabela com: cliente, item, peso, data chegada, dias restantes, status
- [ ] Filtros: cliente, data, prazo vencendo, status
- [ ] Paginação server-side
- **Testes:**
  - [ ] Renderiza itens de todos os clientes
  - [ ] Filtros funcionam corretamente
  - [ ] Paginação funciona

### 4.5.2 Alertas automáticos
- [ ] Badge amarelo: < 7 dias para vencer prazo
- [ ] Badge vermelho: prazo vencido
- [ ] Badge crítico: > 90 dias sem envio
- **Testes:**
  - [ ] Badge correto baseado nos dias
  - [ ] Contagem de dias precisa

### 4.5.3 Ações manuais
- [ ] Prorrogar prazo (input de dias + motivo)
- [ ] Iniciar cobrança manual
- [ ] Contatar cliente (abre modal de mensagem)
- [ ] Log de auditoria para cada ação
- **Testes:**
  - [ ] Prorrogar atualiza deadline
  - [ ] Cobrança cria transação na carteira do cliente
  - [ ] Log criado

---

## TASK 4.6 — Log de Auditoria

### 4.6.1 Schema: AuditLog
- [ ] Campos: `id`, `adminUserId` (FK), `action` (string), `entityType` (string), `entityId`, `details` (JSON), `ipAddress`, `createdAt`
- **Testes:**
  - [ ] Log criado com todos os campos
  - [ ] Índice por entityType + entityId

### 4.6.2 Helper de auditoria
- [ ] `src/lib/utils/audit-logger.ts` — função `logAdminAction(adminId, action, entity, details)`
- [ ] Captura IP do request automaticamente
- **Testes:**
  - [ ] Cria registro correto
  - [ ] Funciona com e sem details
  - [ ] IP capturado dos headers

---

## Validators Zod — Sprint 4

- [ ] `mark-purchased.schema.ts` — valor ¥ > 0, previsão de data, comprovante
- [ ] `warehouse-receive.schema.ts` — fotos 2-3, peso > 0, dimensões > 0
- [ ] `quality-check-result.schema.ts` — resultado enum, foto condicional
- [ ] `mark-shipped.schema.ts` — trackingCode obrigatório, peso > 0
- [ ] `audit-log.schema.ts` — action, entityType, entityId

**Cada schema:** testes válido, inválido, mensagens pt-BR
