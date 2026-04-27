# Sprint 2 — Pedidos + Pagamento (Semanas 3–4)

**Objetivo:** Fluxo completo de criação de pedido, pagamento via Pix e carteira.

---

## TASK 2.1 — Schema Prisma: Pedidos + Carteira

### 2.1.1 Schema: Order
- [ ] Campos: `id`, `userId` (FK), `productUrl`, `productName`, `productImage`, `priceJpy`, `priceBrl`, `serviceFee`, `fixedFee`, `totalBrl`, `quantity`, `variation`, `notes`, `status` (enum: AWAITING_PURCHASE, PURCHASED, IN_TRANSIT_TO_WAREHOUSE, IN_WAREHOUSE), `createdAt`, `updatedAt`
- **Testes:**
  - [ ] Criar pedido com dados válidos
  - [ ] Enum status aceita apenas valores definidos
  - [ ] Relação User 1:N Order funciona

### 2.1.2 Schema: Wallet + Transaction
- [ ] Wallet: `id`, `userId` (FK, unique), `balance` (Decimal), `createdAt`, `updatedAt`
- [ ] Transaction: `id`, `walletId` (FK), `type` (enum: CREDIT, ORDER_PAYMENT, SHIPPING_PAYMENT, EXTRA_SERVICE, STORAGE_FEE, MANUAL_CREDIT, MANUAL_DEBIT), `amount`, `description`, `referenceId`, `createdAt`
- **Testes:**
  - [ ] Saldo não pode ser negativo (RN03)
  - [ ] Transação vinculada à wallet correta
  - [ ] Enum type aceita todos os valores

### 2.1.3 Migration + RLS
- [ ] Rodar migration `add_orders_wallet`
- [ ] RLS: cliente vê apenas seus pedidos e transações
- [ ] Admin vê tudo
- **Testes:**
  - [ ] Cliente A não acessa pedidos de Cliente B
  - [ ] Admin acessa pedidos de todos

---

## TASK 2.2 — Cotação Diária ¥/R$

### 2.2.1 Integração AwesomeAPI
- [ ] Criar `src/lib/utils/exchange-rate.ts`
- [ ] Fetch `economia.awesomeapi.com.br/json/last/JPY-BRL`
- [ ] Cache da cotação no banco (tabela `ExchangeRate`: `date`, `jpyToBrl`, `fetchedAt`)
- [ ] Fallback para última cotação se API falhar
- **Testes:**
  - [ ] Retorna cotação válida (mock API)
  - [ ] Usa cache se cotação do dia já existe
  - [ ] Fallback funciona quando API offline
  - [ ] Formata valor corretamente (4 casas decimais)

### 2.2.2 Cron Job (Edge Function ou Vercel Cron)
- [ ] Executar diariamente às 08:00 BRT
- [ ] Atualizar tabela `ExchangeRate`
- [ ] Logar sucesso/falha
- **Testes:**
  - [ ] Cron cria novo registro de cotação
  - [ ] Não cria duplicata se já existe para o dia

---

## TASK 2.3 — Scraping de Produto JP

### 2.3.1 API Route `/api/scraper`
- [ ] Recebe URL do produto, valida domínio (lista de plataformas aceitas)
- [ ] Cheerio + fetch server-side
- [ ] Extrair: nome, preço (¥), imagem principal
- [ ] Parsers específicos: Amazon JP, Mercari, Rakuten, Yahoo Auctions
- [ ] Retorna JSON com dados ou erro
- **Testes:**
  - [ ] Amazon JP: extrai nome, preço, imagem (HTML mockado)
  - [ ] Mercari: extrai dados corretamente
  - [ ] URL inválida retorna erro 400
  - [ ] Domínio não aceito retorna erro 422
  - [ ] Timeout após 10s retorna erro 504
  - [ ] HTML sem dados esperados retorna erro parcial com campos faltantes

### 2.3.2 Fallback manual
- [ ] Quando scraping falha, exibir formulário manual
- [ ] Campos: nome do produto, preço em ¥, upload de foto
- **Testes:**
  - [ ] Formulário manual renderiza quando scraping falha
  - [ ] Submissão manual com dados válidos funciona
  - [ ] Validação: preço > 0, nome obrigatório

---

## TASK 2.4 — Tela de Criação de Pedido

### 2.4.1 Step 1: Input de URL
- [ ] Campo URL com validação
- [ ] Botão "Buscar produto"
- [ ] Loading state durante scraping
- **Testes:**
  - [ ] Valida URL format
  - [ ] Exibe loading durante fetch
  - [ ] Exibe preview ao retornar dados

### 2.4.2 Step 2: Preview + Edição
- [ ] Exibe foto, nome, preço em ¥ do scraping
- [ ] Campos editáveis: quantidade, variação (cor/tamanho), observações
- [ ] Permite editar dados do scraping (nome, preço)
- **Testes:**
  - [ ] Renderiza preview com dados do scraping
  - [ ] Campos editáveis funcionam
  - [ ] Quantidade mínimo 1

### 2.4.3 Step 3: Resumo de custos
- [ ] Valor do produto: ¥ e R$ (cotação do dia)
- [ ] Taxa de serviço: % configurável
- [ ] Taxa fixa por pedido: valor configurável
- [ ] Total em R$
- **Testes:**
  - [ ] Cálculo correto: `(priceJpy * rate) + (priceJpy * rate * serviceFee%) + fixedFee`
  - [ ] Exibe valores formatados em BRL e JPY
  - [ ] Recalcula ao mudar quantidade

### 2.4.4 Step 4: Pagamento
- [ ] Opção 1: Débito da carteira (se saldo suficiente)
- [ ] Opção 2: Pix direto (gera QR Code)
- [ ] Botão "Confirmar pedido"
- **Testes:**
  - [ ] Débito da carteira só habilitado se saldo >= total
  - [ ] Pix gera QR Code
  - [ ] Pedido criado com status AWAITING_PURCHASE após pagamento

---

## TASK 2.5 — Integração Mercado Pago (Pix)

### 2.5.1 Configurar SDK
- [ ] Instalar `mercadopago`
- [ ] Criar `src/lib/mercadopago/client.ts`
- [ ] Configurar access token via env var
- **Teste:** Client inicializa corretamente

### 2.5.2 API Route: Gerar cobrança Pix
- [ ] `POST /api/payments/pix` — recebe amount, description, referenceId
- [ ] Cria cobrança no Mercado Pago
- [ ] Retorna QR Code (base64) + código copia-e-cola + paymentId
- **Testes:**
  - [ ] Gera cobrança com valor correto (mock SDK)
  - [ ] Retorna QR Code e código
  - [ ] Valor inválido (<=0) retorna erro 422

### 2.5.3 Webhook de confirmação
- [ ] `POST /api/webhooks/mercadopago`
- [ ] Validar assinatura HMAC
- [ ] Processar evento `payment.approved`
- [ ] Atualizar status do pedido ou crédito na carteira
- [ ] Criar transação no extrato
- **Testes:**
  - [ ] Assinatura válida processa pagamento
  - [ ] Assinatura inválida retorna 401
  - [ ] Pagamento duplicado é ignorado (idempotência)
  - [ ] Credita carteira corretamente
  - [ ] Confirma pedido corretamente

---

## TASK 2.6 — Tela da Carteira

### 2.6.1 Saldo e adicionar créditos
- [ ] Card com saldo em destaque (R$)
- [ ] Botão "Adicionar créditos" → input de valor + gera Pix
- [ ] QR Code modal com timer de expiração
- **Testes:**
  - [ ] Exibe saldo formatado corretamente
  - [ ] Valor mínimo para adição (R$ 10)
  - [ ] QR Code renderiza no modal

### 2.6.2 Extrato
- [ ] Lista de transações com filtros: tipo, período
- [ ] Cada item: data, tipo (badge colorido), descrição, valor (+/-), saldo após
- [ ] Paginação ou infinite scroll
- **Testes:**
  - [ ] Renderiza transações corretamente
  - [ ] Filtro por tipo funciona
  - [ ] Valores positivos em verde, negativos em vermelho
  - [ ] Paginação carrega mais itens

---

## TASK 2.7 — Tela "Meus Pedidos"

### 2.7.1 Lista de pedidos
- [ ] Cards com: foto, nome, status (badge), data, valor
- [ ] Filtro por status
- [ ] Ordenação por data (mais recente primeiro)
- **Testes:**
  - [ ] Renderiza pedidos do usuário
  - [ ] Badge correto para cada status
  - [ ] Filtro funciona

### 2.7.2 Detalhes do pedido
- [ ] Modal ou página com informações completas
- [ ] Timeline visual de status
- [ ] Botão "Cancelar" (apenas status AWAITING_PURCHASE — RN10)
- **Testes:**
  - [ ] Exibe todos os dados do pedido
  - [ ] Timeline marca status atual
  - [ ] Cancelar visível apenas em AWAITING_PURCHASE
  - [ ] Cancelar reembolsa carteira

### 2.7.3 Server Action: cancelar pedido
- [ ] Validar que status é AWAITING_PURCHASE
- [ ] Reembolsar valor na carteira
- [ ] Criar transação de reembolso
- [ ] Atualizar status para CANCELLED
- **Testes:**
  - [ ] Cancelamento válido reembolsa e atualiza status
  - [ ] Cancelamento em status != AWAITING_PURCHASE retorna erro
  - [ ] Transação de reembolso criada corretamente

---

## Validators Zod — Sprint 2

- [ ] `order-create.schema.ts` — URL, quantidade, variação, notas
- [ ] `product-url.schema.ts` — valida URL + domínio aceito
- [ ] `payment-pix.schema.ts` — amount > 0, description
- [ ] `wallet-add-credit.schema.ts` — amount >= 10
- [ ] `exchange-rate.schema.ts` — valida resposta da API de câmbio

**Cada schema:** testes com input válido, cada tipo inválido, mensagens pt-BR
