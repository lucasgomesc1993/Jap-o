# Sprint 3 — Armazém + Envios (Semanas 5–6)

**Objetivo:** Gestão de itens no armazém, serviços extras e fluxo completo de envio consolidado.

---

## TASK 3.1 — Schema Prisma: Armazém + Envios

### 3.1.1 Schema: WarehouseItem
- [ ] Campos: `id`, `orderId` (FK), `userId` (FK), `name`, `photos` (JSON array), `weightGrams`, `lengthCm`, `widthCm`, `heightCm`, `arrivedAt`, `freeStorageDeadline`, `status` (AVAILABLE, SELECTED_FOR_SHIPMENT, SHIPPED), `createdAt`
- **Testes:**
  - [ ] Criar item com dados válidos
  - [ ] Relação Order 1:1 WarehouseItem
  - [ ] Enum status correto

### 3.1.2 Schema: ExtraService
- [ ] Campos: `id`, `warehouseItemId` (FK), `type` (EXTRA_PHOTO, QUALITY_CHECK, REMOVE_PACKAGING, EXTRA_PROTECTION), `status` (REQUESTED, COMPLETED), `price`, `resultNotes`, `resultPhotos` (JSON), `createdAt`
- **Testes:**
  - [ ] Criar serviço vinculado a item
  - [ ] Enum type e status corretos

### 3.1.3 Schema: Shipment + ShipmentItem
- [ ] Shipment: `id`, `userId` (FK), `shippingMethod` (SAL, EMS, DHL, FEDEX), `totalWeightGrams`, `shippingCostBrl`, `insuranceCostBrl`, `hasInsurance`, `declaredValueType` (REAL, MANUAL), `declaredValueBrl`, `manualDeclaredValueBrl`, `disclaimerAcceptedAt`, `disclaimerIp`, `disclaimerTextVersion`, `addressId` (FK), `trackingCode`, `status` (PREPARING, SHIPPED, IN_TRANSIT, IN_BRAZIL, OUT_FOR_DELIVERY, DELIVERED), `createdAt`, `updatedAt`
- [ ] ShipmentItem: `id`, `shipmentId` (FK), `warehouseItemId` (FK)
- **Testes:**
  - [ ] Criar envio com itens
  - [ ] Relação Shipment N:N WarehouseItem via ShipmentItem
  - [ ] Todos os enums corretos

### 3.1.4 Migration + RLS
- [ ] Rodar migration `add_warehouse_shipments`
- [ ] RLS: cliente vê apenas seus itens e envios
- **Testes:** isolamento de dados entre clientes

---

## TASK 3.2 — Tela do Armazém (Cliente)

### 3.2.1 Lista de itens
- [ ] Cards com: foto principal, nome, peso, volume (C×L×A), data de chegada
- [ ] Prazo de armazenamento gratuito com barra de progresso
- [ ] Alerta visual (amarelo < 7 dias, vermelho = vencido)
- [ ] Badge de status (Disponível, Selecionado, Enviado)
- **Testes:**
  - [ ] Renderiza itens do usuário
  - [ ] Barra de progresso calcula % correta
  - [ ] Alerta aparece quando prazo < 7 dias
  - [ ] Alerta vermelho quando prazo vencido
  - [ ] Estado vazio com mensagem

### 3.2.2 Detalhes do item
- [ ] Modal com todas as fotos (galeria), peso, dimensões, data de chegada
- [ ] Histórico de serviços extras solicitados
- **Testes:**
  - [ ] Galeria de fotos navega corretamente
  - [ ] Exibe todos os dados do item

---

## TASK 3.3 — Serviços Extras

### 3.3.1 Botões de serviço por item
- [ ] Botões: Foto Extra (R$5), Quality Check (R$10), Remoção Embalagem (R$5), Proteção Extra (R$8)
- [ ] Preços vindos das configurações do admin
- [ ] Confirmar com modal: "Será debitado R$ X da sua carteira"
- **Testes:**
  - [ ] Renderiza botões com preços corretos
  - [ ] Modal de confirmação exibe valor
  - [ ] Botão desabilitado se saldo insuficiente

### 3.3.2 Server Action: solicitar serviço extra
- [ ] Validar saldo suficiente (RN03)
- [ ] Criar ExtraService com status REQUESTED
- [ ] Debitar carteira + criar transação
- [ ] Notificar admin (notificação interna)
- **Testes:**
  - [ ] Serviço criado e carteira debitada
  - [ ] Saldo insuficiente retorna erro
  - [ ] Transação criada com tipo EXTRA_SERVICE
  - [ ] Serviço duplicado (mesmo tipo no mesmo item) retorna erro

---

## TASK 3.4 — Seleção de Itens para Envio

### 3.4.1 Interface de seleção
- [ ] Checkboxes em cada item com status AVAILABLE
- [ ] Resumo flutuante: X itens selecionados, peso total, botão "Criar Envio"
- [ ] Desabilitar itens que já estão em outro envio
- **Testes:**
  - [ ] Checkbox seleciona/deseleciona item
  - [ ] Resumo atualiza ao selecionar
  - [ ] Botão "Criar Envio" habilitado apenas com >= 1 item
  - [ ] Itens SELECTED_FOR_SHIPMENT não são selecionáveis

---

## TASK 3.5 — Wizard de Criação de Envio (5 Steps)

### 3.5.1 Step 1: Resumo dos Itens
- [ ] Lista dos itens selecionados com foto, nome, peso
- [ ] Peso total calculado (soma)
- [ ] Dimensões estimadas (maior de cada eixo)
- [ ] Botão voltar (volta para armazém) e próximo
- **Testes:**
  - [ ] Lista exibe itens corretos
  - [ ] Peso total calcula corretamente
  - [ ] Navegação prev/next funciona

### 3.5.2 Step 2: Método de Frete
- [ ] Cards para cada método: SAL (~45d, $), EMS (~15d, $$$), DHL (~5d, $$$$), FedEx (~5d, $$$$)
- [ ] Custo calculado por peso + tabela de preços do admin
- [ ] Radio selection
- **Testes:**
  - [ ] Renderiza 4 métodos com custos
  - [ ] Cálculo de frete correto por faixa de peso
  - [ ] Seleção única (radio)
  - [ ] Custo atualiza baseado no peso total

### 3.5.3 Step 3: Seguro + Declaração Aduaneira
- [ ] Toggle de seguro (valor = % do valor declarado)
- [ ] Opção A: Valor real (preenchido automaticamente, soma dos valores dos itens)
- [ ] Opção B: Valor manual — input de valor + modal de responsabilidade
- [ ] Modal: texto configurável pelo admin + checkbox obrigatório "Li e aceito"
- [ ] Gravar aceite: userId, IP, timestamp, versão do texto (RN04)
- [ ] Seguro desabilitado se declaração manual (RN05)
- **Testes:**
  - [ ] Valor real preenche automaticamente
  - [ ] Valor manual habilita input
  - [ ] Modal de responsabilidade aparece ao selecionar manual
  - [ ] Checkbox obrigatório para prosseguir
  - [ ] Aceite grava IP + timestamp + userId + versão
  - [ ] Seguro toggle desabilitado quando manual selecionado
  - [ ] Seguro calcula valor correto

### 3.5.4 Step 4: Endereço de Entrega
- [ ] Lista de endereços cadastrados (radio selection)
- [ ] Opção "Adicionar novo endereço" (formulário inline com ViaCEP)
- [ ] Endereço default pré-selecionado
- **Testes:**
  - [ ] Renderiza endereços do usuário
  - [ ] Default pré-selecionado
  - [ ] Novo endereço salva e seleciona
  - [ ] Validação do formulário de endereço

### 3.5.5 Step 5: Resumo Final + Pagamento
- [ ] Resumo: itens, método, frete, seguro, serviços extras, total
- [ ] Pagamento: carteira ou Pix
- [ ] Botão "Confirmar e Pagar"
- **Testes:**
  - [ ] Resumo exibe todos os valores corretos
  - [ ] Total = frete + seguro
  - [ ] Pagamento via carteira debita e cria envio
  - [ ] Pagamento via Pix gera QR Code
  - [ ] Após pagamento, itens mudam para SELECTED_FOR_SHIPMENT

### 3.5.6 Server Action: criar envio
- [ ] Validar todos os dados (Zod)
- [ ] Validar saldo se pagamento via carteira
- [ ] Criar Shipment + ShipmentItems
- [ ] Atualizar status dos WarehouseItems
- [ ] Debitar carteira ou gerar Pix
- [ ] Criar transação SHIPPING_PAYMENT
- **Testes:**
  - [ ] Envio criado com dados corretos
  - [ ] Itens atualizados para SELECTED_FOR_SHIPMENT
  - [ ] Carteira debitada corretamente
  - [ ] Envio com saldo insuficiente retorna erro
  - [ ] Item já selecionado retorna erro (concorrência)

---

## TASK 3.6 — Tela "Meus Envios"

### 3.6.1 Lista de envios
- [ ] Cards: método, status (badge), data, tracking code, qtd itens, valor
- [ ] Filtro por status
- **Testes:**
  - [ ] Renderiza envios do usuário
  - [ ] Badge correto por status
  - [ ] Filtro funciona

### 3.6.2 Detalhes do envio
- [ ] Timeline visual dos estados
- [ ] Lista de itens incluídos
- [ ] Código de rastreio (link clicável quando disponível)
- [ ] Dados de declaração (tipo + valor)
- [ ] Botão "Confirmar Entrega" (só no status OUT_FOR_DELIVERY)
- **Testes:**
  - [ ] Timeline marca status atual
  - [ ] Rastreio exibe quando disponível
  - [ ] Confirmar entrega muda status para DELIVERED
  - [ ] Botão confirmar só visível no status correto

---

## TASK 3.7 — Cálculos de Frete

### 3.7.1 Engine de cálculo
- [ ] `src/lib/utils/shipping-calculator.ts`
- [ ] Tabela de preços por método e faixa de peso (configurável pelo admin)
- [ ] Faixas: 0-500g, 500g-1kg, 1-2kg, 2-5kg, 5-10kg, 10-20kg, 20-30kg
- [ ] Fórmula: `basePrice + (weight * pricePerGram)` por faixa
- **Testes:**
  - [ ] Cálculo correto para cada método em cada faixa
  - [ ] Peso no limite da faixa usa faixa correta
  - [ ] Peso zero retorna erro
  - [ ] Peso acima de 30kg retorna erro (limite)

---

## Validators Zod — Sprint 3

- [ ] `warehouse-item.schema.ts` — peso > 0, dimensões > 0
- [ ] `extra-service.schema.ts` — tipo válido, warehouseItemId
- [ ] `shipment-create.schema.ts` — items[], method, address, declaration
- [ ] `customs-declaration.schema.ts` — tipo, valor, aceite
- [ ] `shipping-method.schema.ts` — SAL/EMS/DHL/FEDEX

**Cada schema:** testes válido, inválido, mensagens pt-BR
