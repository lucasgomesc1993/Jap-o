# Sprint 3 — Armazém + Envios (Semanas 5–6)

**Objetivo:** Gestão de itens no armazém, serviços extras e fluxo completo de envio consolidado.

---

## TASK 3.1 — Schema Prisma: Armazém + Envios

### 3.1.1 Schema: WarehouseItem
- [x] Campos: `id`, `orderId` (FK), `userId` (FK), `name`, `photos` (JSON array), `weightGrams`, `lengthCm`, `widthCm`, `heightCm`, `arrivedAt`, `freeStorageDeadline`, `status` (AVAILABLE, SELECTED_FOR_SHIPMENT, SHIPPED), `createdAt`
- **Testes:**
  - [x] Criar item com dados válidos
  - [x] Relação Order 1:1 WarehouseItem
  - [x] Enum status correto

### 3.1.2 Schema: ExtraService
- [x] Campos: `id`, `warehouseItemId` (FK), `type` (EXTRA_PHOTO, QUALITY_CHECK, REMOVE_PACKAGING, EXTRA_PROTECTION), `status` (REQUESTED, COMPLETED), `price`, `resultNotes`, `resultPhotos` (JSON), `createdAt`
- **Testes:**
  - [x] Criar serviço vinculado a item
  - [x] Enum type e status corretos

### 3.1.3 Schema: Shipment + ShipmentItem
- [x] Shipment: `id`, `userId` (FK), `shippingMethod` (SAL, EMS, DHL, FEDEX), `totalWeightGrams`, `shippingCostBrl`, `insuranceCostBrl`, `hasInsurance`, `declaredValueType` (REAL, MANUAL), `declaredValueBrl`, `manualDeclaredValueBrl`, `disclaimerAcceptedAt`, `disclaimerIp`, `disclaimerTextVersion`, `addressId` (FK), `trackingCode`, `status` (PREPARING, SHIPPED, IN_TRANSIT, IN_BRAZIL, OUT_FOR_DELIVERY, DELIVERED), `createdAt`, `updatedAt`
- [x] ShipmentItem: `id`, `shipmentId` (FK), `warehouseItemId` (FK)
- **Testes:**
  - [x] Criar envio com itens
  - [x] Relação Shipment N:N WarehouseItem via ShipmentItem
  - [x] Todos os enums corretos

### 3.1.4 Migration + RLS
- [x] Rodar migration `add_warehouse_shipments` (via db push)
- [x] RLS: cliente vê apenas seus itens e envios
- **Testes:** isolamento de dados entre clientes (Script SQL aplicado com Grants)

---

## TASK 3.2 — Tela do Armazém (Cliente)

### 3.2.1 Lista de itens
- [x] Cards com: foto principal, nome, peso, volume (C×L×A), data de chegada
- [x] Prazo de armazenamento gratuito com barra de progresso
- [x] Alerta visual (amarelo < 7 dias, vermelho = vencido)
- [x] Badge de status (Disponível, Selecionado, Enviado)
- **Testes:**
  - [x] Renderiza itens do usuário
  - [x] Barra de progresso calcula % correta
  - [x] Alerta aparece quando prazo < 7 dias
  - [x] Alerta vermelho quando prazo vencido
  - [x] Estado vazio com mensagem

### 3.2.2 Detalhes do item
- [x] Modal com todas as fotos (galeria), peso, dimensões, data de chegada
- [x] Histórico de serviços extras solicitados
- **Testes:**
  - [x] Galeria de fotos navega corretamente
  - [x] Exibe todos os dados do item

---

## TASK 3.3 — Serviços Extras

### 3.3.1 Botões de serviço por item
- [x] Botões: Foto Extra (R$5), Quality Check (R$10), Remoção Embalagem (R$5), Proteção Extra (R$8)
- [x] Preços vindos das configurações do admin
- [x] Confirmar com modal: "Será debitado R$ X da sua carteira"
- **Testes:**
  - [x] Renderiza botões com preços corretos
  - [x] Modal de confirmação exibe valor
  - [x] Botão desabilitado se saldo insuficiente

### 3.3.2 Server Action: solicitar serviço extra
- [x] Validar saldo suficiente (RN03)
- [x] Criar ExtraService com status REQUESTED
- [x] Debitar carteira + criar transação
- [x] Notificar admin (notificação interna)
- **Testes:**
  - [x] Serviço criado e carteira debitada
  - [x] Saldo insuficiente retorna erro
  - [x] Transação criada com tipo EXTRA_SERVICE
  - [x] Serviço duplicado (mesmo tipo no mesmo item) retorna erro

---

## TASK 3.4 — Seleção de Itens para Envio

### 3.4.1 Interface de seleção
- [x] Checkboxes em cada item com status AVAILABLE
- [x] Resumo flutuante: X itens selecionados, peso total, botão "Criar Envio"
- [x] Desabilitar itens que já estão em outro envio
- **Testes:**
  - [x] Checkbox seleciona/deseleciona item
  - [x] Resumo atualiza ao selecionar
  - [x] Botão "Criar Envio" habilitado apenas com >= 1 item
  - [x] Itens SELECTED_FOR_SHIPMENT não são selecionáveis

---

## TASK 3.5 — Wizard de Criação de Envio (5 Steps)

### 3.5.1 Step 1: Resumo dos Itens
- [x] Lista dos itens selecionados com foto, nome, peso
- [x] Peso total calculado (soma)
- [x] Dimensões estimadas (maior de cada eixo)
- [x] Botão voltar (volta para armazém) e próximo
- **Testes:**
  - [x] Lista exibe itens corretos
  - [x] Peso total calcula corretamente
  - [x] Navegação prev/next funciona

### 3.5.2 Step 2: Método de Frete
- [x] Cards para cada método: SAL (~45d, $), EMS (~15d, $$$), DHL (~5d, $$$$), FedEx (~5d, $$$$)
- [x] Custo calculado por peso + tabela de preços do admin
- [x] Radio selection
- **Testes:**
  - [x] Renderiza 4 métodos com custos
  - [x] Cálculo de frete correto por faixa de peso
  - [x] Seleção única (radio)
  - [x] Custo atualiza baseado no peso total

### 3.5.3 Step 3: Seguro + Declaração Aduaneira
- [x] Toggle de seguro (valor = % do valor declarado)
- [x] Opção A: Valor real (preenchido automaticamente, soma dos valores dos itens)
- [x] Opção B: Valor manual — input de valor + modal de responsabilidade
- [x] Modal: texto configurável pelo admin + checkbox obrigatório "Li e aceito"
- [x] Gravar aceite: userId, IP, timestamp, versão do texto (RN04)
- [x] Seguro desabilitado se declaração manual (RN05)
- **Testes:**
  - [x] Valor real preenche automaticamente
  - [x] Valor manual habilita input
  - [x] Modal de responsabilidade aparece ao selecionar manual
  - [x] Checkbox obrigatório para prosseguir
  - [x] Aceite grava IP + timestamp + userId + versão
  - [x] Seguro toggle desabilitado quando manual selecionado
  - [x] Seguro calcula valor correto

### 3.5.4 Step 4: Endereço de Entrega
- [x] Lista de endereços cadastrados (radio selection)
- [x] Opção "Adicionar novo endereço" (formulário inline com ViaCEP)
- [x] Endereço default pré-selecionado
- **Testes:**
  - [x] Renderiza endereços do usuário
  - [x] Default pré-selecionado
  - [x] Novo endereço salva e seleciona
  - [x] Validação do formulário de endereço

### 3.5.5 Step 5: Resumo Final + Pagamento
- [x] Resumo: itens, método, frete, seguro, serviços extras, total
- [x] Pagamento: carteira ou Pix
- [x] Botão "Confirmar e Pagar"
- **Testes:**
  - [x] Resumo exibe todos os valores corretos
  - [x] Total = frete + seguro
  - [x] Pagamento via carteira debita e cria envio
  - [x] Pagamento via Pix gera QR Code
  - [x] Após pagamento, itens mudam para SELECTED_FOR_SHIPMENT

### 3.5.6 Server Action: criar envio
- [x] Validar todos os dados (Zod)
- [x] Validar saldo se pagamento via carteira
- [x] Criar Shipment + ShipmentItems
- [x] Atualizar status dos WarehouseItems
- [x] Debitar carteira ou gerar Pix
- [x] Criar transação SHIPPING_PAYMENT
- **Testes:**
  - [x] Envio criado com dados corretos
  - [x] Itens atualizados para SELECTED_FOR_SHIPMENT
  - [x] Carteira debitada corretamente
  - [x] Envio com saldo insuficiente retorna erro
  - [x] Item já selecionado retorna erro (concorrência)

---

## TASK 3.6 — Tela "Meus Envios"

### 3.6.1 Lista de envios
- [x] Cards: método, status (badge), data, tracking code, qtd itens, valor
- [x] Filtro por status
- **Testes:**
  - [x] Renderiza envios do usuário
  - [x] Badge correto por status
  - [x] Filtro funciona

### 3.6.2 Detalhes do envio
- [x] Timeline visual dos estados
- [x] Lista de itens incluídos
- [x] Código de rastreio (link clicável quando disponível)
- [x] Dados de declaração (tipo + valor)
- [x] Botão "Confirmar Entrega" (só no status OUT_FOR_DELIVERY)
- **Testes:**
  - [x] Timeline marca status atual
  - [x] Rastreio exibe quando disponível
  - [x] Confirmar entrega muda status para DELIVERED
  - [x] Botão confirmar só visível no status correto

---

## TASK 3.7 — Cálculos de Frete

### 3.7.1 Engine de cálculo
- [x] `src/lib/utils/shipping-calculator.ts`
- [x] Tabela de preços por método e faixa de peso (configurável pelo admin)
- [x] Faixas: 0-500g, 500g-1kg, 1-2kg, 2-5kg, 5-10kg, 10-20kg, 20-30kg
- [x] Fórmula: `basePrice + (weight * pricePerGram)` por faixa
- **Testes:**
  - [x] Cálculo correto para cada método em cada faixa
  - [x] Peso no limite da faixa usa faixa correta
  - [x] Peso zero retorna erro
  - [x] Peso acima de 30kg retorna erro (limite)

---

## Validators Zod — Sprint 3

- [x] `warehouse-item.schema.ts` — peso > 0, dimensões > 0
- [x] `extra-service.schema.ts` — tipo válido, warehouseItemId
- [x] `shipment-create.schema.ts` — items[], method, address, declaration
- [x] `customs-declaration.schema.ts` — tipo, valor, aceite
- [x] `shipping-method.schema.ts` — SAL/EMS/DHL/FEDEX

**Cada schema:** testes válido, inválido, mensagens pt-BR
