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
- [x] Tabela: cliente, produto (link), variação, observações, valor cobrado, data
- [x] Ordenação por data (mais antigo primeiro)
- [x] Busca por nome do cliente ou produto
- **Testes:**
  - [x] Renderiza apenas pedidos AWAITING_PURCHASE (e PURCHASED para fluxo)
  - [x] Ordenação correta
  - [x] Busca filtra resultados

### 4.2.2 Ação "Marcar como Comprado"
- [x] Modal com: valor real pago em ¥, previsão de chegada, upload de comprovante
- [x] Atualiza status para PURCHASED
- [x] Registra valor real vs cobrado (para controle financeiro)
- [x] Upload do comprovante ao bucket `receipts`
- [x] Log de auditoria
- **Testes:**
  - [x] Status atualizado para PURCHASED
  - [x] Valor real registrado
  - [x] Comprovante salvo no storage
  - [x] Log de auditoria criado (userId + timestamp + ação)
  - [x] Campos obrigatórios validados

### 4.2.3 Ação "Marcar Em Trânsito para Armazém"
- [x] Botão direto na lista após "Comprado"
- [x] Atualiza status para IN_TRANSIT_TO_WAREHOUSE
- [x] Log de auditoria
- **Testes:**
  - [x] Só funciona em pedidos PURCHASED
  - [x] Log criado

---

## TASK 4.3 — Recebimento no Armazém (Admin)

### 4.3.1 Busca de pedido
- [x] Busca por nome, código ou cliente
- [x] Filtrar pedidos IN_TRANSIT_TO_WAREHOUSE
- **Testes:**
  - [x] Busca encontra pedido por nome/código/cliente
  - [x] Filtra apenas status correto

### 4.3.2 Formulário de recebimento
- [x] Upload obrigatório de 2-3 fotos (RN08)
- [x] Informar peso real (g) e dimensões (cm × cm × cm)
- [x] Se Quality Check solicitado: resultado (OK/Problema) + foto se problema
- [x] Botão "Confirmar Recebimento"
- **Testes:**
  - [x] Rejeita se < 2 fotos
  - [x] Aceita 2-3 fotos
  - [x] Peso e dimensões obrigatórios (> 0)
  - [x] Quality Check: resultado obrigatório se solicitado
  - [x] Foto de problema obrigatória se resultado = Problema

### 4.3.3 Server Action: confirmar recebimento
- [x] Atualizar status do pedido para IN_WAREHOUSE
- [x] Criar WarehouseItem com fotos, peso, dimensões
- [x] Calcular freeStorageDeadline (config dias + arrivedAt)
- [x] Enviar notificação ao cliente (email + push)
- [x] Log de auditoria
- **Testes:**
  - [x] Pedido atualizado para IN_WAREHOUSE
  - [x] WarehouseItem criado com dados corretos
  - [x] Deadline calculado corretamente
  - [x] Email disparado (mock Resend)
  - [x] Log de auditoria criado

---

## TASK 4.4 — Expedição (Admin)

### 4.4.1 Lista de envios "Preparando Pacote"
- [x] Tabela: cliente, itens, método, valor declarado, endereço
- [x] Flag visual ⚠️ para declaração manual
- **Testes:**
  - [x] Renderiza apenas status PREPARING
  - [x] Flag para declaração manual visível
  - [x] Dados completos exibidos

### 4.4.2 Ação "Marcar como Enviado"
- [x] Modal: código de rastreio (obrigatório), peso final real
- [x] Atualiza status para SHIPPED
- [x] Envia notificação com código de rastreio ao cliente
- [x] Log de auditoria
- **Testes:**
  - [x] Rastreio obrigatório (validação)
  - [x] Status atualizado para SHIPPED
  - [x] Email com rastreio disparado
  - [x] Log criado

### 4.4.3 Atualização manual de status
- [x] Dropdown: IN_TRANSIT, IN_BRAZIL, OUT_FOR_DELIVERY
- [x] Cada mudança notifica o cliente
- [x] Log de auditoria
- **Testes:**
  - [x] Transição de status válida (não pode pular estados)
  - [x] Notificação em cada mudança
  - [x] Log para cada ação

---

## TASK 4.5 — Gestão do Armazém (Admin)

### 4.5.1 Visão geral de todos os itens
- [x] Tabela com: cliente, item, peso, data chegada, dias restantes, status
- [x] Filtros: cliente, data, prazo vencendo, status
- [x] Paginação server-side
- **Testes:**
  - [x] Renderiza itens de todos os clientes
  - [x] Filtros funcionam corretamente
  - [x] Paginação funciona

### 4.5.2 Alertas automáticos
- [x] Badge amarelo: < 7 dias para vencer prazo
- [x] Badge vermelho: prazo vencido
- [x] Badge crítico: > 90 dias sem envio
- **Testes:**
  - [x] Badge correto baseado nos dias
  - [x] Contagem de dias precisa

### 4.5.3 Ações manuais
- [x] Prorrogar prazo (input de dias + motivo)
- [x] Iniciar cobrança manual
- [x] Contatar cliente (abre modal de mensagem)
- [x] Log de auditoria para cada ação
- **Testes:**
  - [x] Prorrogar atualiza deadline
  - [x] Cobrança cria transação na carteira do cliente
  - [x] Log criado

---

## TASK 4.6 — Log de Auditoria

### 4.6.1 Schema: AuditLog
- [x] Campos: `id`, `adminUserId` (FK), `action` (string), `entityType` (string), `entityId`, `details` (JSON), `ipAddress`, `createdAt`
- **Testes:**
  - [x] Log criado com todos os campos
- [x] Índice por entityType + entityId

### 4.6.2 Helper de auditoria
- [x] `src/lib/utils/audit-logger.ts` — função `logAdminAction(adminId, action, entity, details)`
- [x] Captura IP do request automaticamente
- **Testes:**
  - [x] Cria registro correto
- [x] Funciona com e sem details
- [x] IP capturado dos headers

---

## Validators Zod — Sprint 4

- [x] `mark-purchased.schema.ts` — valor ¥ > 0, previsão de data, comprovante
- [x] `warehouse-receive.schema.ts` — fotos 2-3, peso > 0, dimensões > 0
- [x] `quality-check-result.schema.ts` — resultado enum, foto condicional
- [x] `mark-shipped.schema.ts` — trackingCode obrigatório, peso > 0
- [x] `audit-log.schema.ts` — action, entityType, entityId

**Cada schema:** testes válido, inválido, mensagens pt-BR
