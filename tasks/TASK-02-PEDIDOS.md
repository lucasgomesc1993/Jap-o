# Sprint 2 — Pedidos + Pagamento (Semanas 3–4)

**Objetivo:** Fluxo completo de criação de pedido, pagamento via Pix e carteira.

---

## TASK 2.1 — Schema Prisma: Pedidos + Carteira

### 2.1.1 Schema: Order
- [x] Campos: `id`, `userId` (FK), `productUrl`, `productName`, `productImage`, `priceJpy`, `priceBrl`, `serviceFee`, `fixedFee`, `totalBrl`, `quantity`, `variation`, `notes`, `status` (enum: AWAITING_PURCHASE, PURCHASED, IN_TRANSIT_TO_WAREHOUSE, IN_WAREHOUSE), `createdAt`, `updatedAt`
- **Testes:**
  - [x] Criar pedido com dados válidos
  - [x] Enum status aceita apenas valores definidos
  - [x] Relação User 1:N Order funciona

### 2.1.2 Schema: Wallet + Transaction
- [x] Wallet: `id`, `userId` (FK, unique), `balance` (Decimal), `createdAt`, `updatedAt`
- [x] Transaction: `id`, `walletId` (FK), `type` (enum: CREDIT, ORDER_PAYMENT, SHIPPING_PAYMENT, EXTRA_SERVICE, STORAGE_FEE, MANUAL_CREDIT, MANUAL_DEBIT), `amount`, `description`, `referenceId`, `createdAt`
- **Testes:**
  - [x] Saldo não pode ser negativo (RN03)
  - [x] Transação vinculada à wallet correta
  - [x] Enum type aceita todos os valores

### 2.1.3 Migration + RLS
- [x] Rodar migration `add_orders_wallet`
- [x] RLS: cliente vê apenas seus pedidos e transações
- [x] Admin vê tudo
- **Testes:**
  - [x] Cliente A não acessa pedidos de Cliente B
  - [x] Admin acessa pedidos de todos

---

## TASK 2.2 — Cotação Diária ¥/R$

### 2.2.1 Integração AwesomeAPI
- [x] Criar `src/lib/utils/exchange-rate.ts`
- [x] Fetch `economia.awesomeapi.com.br/json/last/JPY-BRL`
- [x] Cache da cotação no banco (tabela `ExchangeRate`: `date`, `jpyToBrl`, `fetchedAt`)
- [x] Fallback para última cotação se API falhar
- **Testes:**
  - [x] Retorna cotação válida (mock API)
  - [x] Usa cache se cotação do dia já existe
  - [x] Fallback funciona quando API offline
  - [x] Formata valor corretamente (4 casas decimais)

### 2.2.2 Cron Job (Edge Function ou Vercel Cron)
- [x] Executar diariamente às 08:00 BRT
- [x] Atualizar tabela `ExchangeRate`
- [x] Logar sucesso/falha
- **Testes:**
  - [x] Cron cria novo registro de cotação
  - [x] Não cria duplicata se já existe para o dia

---

## TASK 2.3 — Scraping de Produto JP

### 2.3.1 API Route `/api/scraper`
- [x] Recebe URL do produto, valida domínio (lista de plataformas aceitas)
- [x] Cheerio + fetch server-side
- [x] Extrair: nome, preço (¥), imagem principal
- [x] Parsers específicos: Amazon JP, Mercari, Rakuten, Yahoo Auctions
- [x] Retorna JSON com dados ou erro
- **Testes:**
  - [x] Amazon JP: extrai nome, preço, imagem (HTML mockado)
  - [x] Mercari: extrai dados corretamente
  - [x] URL inválida retorna erro 400
  - [x] Domínio não aceito retorna erro 422
  - [x] Timeout após 10s retorna erro 504
  - [x] HTML sem dados esperados retorna erro parcial com campos faltantes

### 2.3.2 Fallback manual
- [x] Quando scraping falha, exibir formulário manual
- [x] Campos: nome do produto, preço em ¥, upload de foto
- **Testes:**
  - [x] Formulário manual renderiza quando scraping falha
  - [x] Submissão manual com dados válidos funciona
  - [x] Validação: preço > 0, nome obrigatório

---

## TASK 2.4 — Tela de Criação de Pedido

### 2.4.1 Step 1: Input de URL
- [x] Campo URL com validação
- [x] Botão "Buscar produto"
- [x] Loading state durante scraping
- **Testes:**
  - [x] Valida URL format
  - [x] Exibe loading durante fetch
  - [x] Exibe preview ao retornar dados

### 2.4.2 Step 2: Preview + Edição
- [x] Exibe foto, nome, preço em ¥ do scraping
- [x] Campos editáveis: quantidade, variação (cor/tamanho), observações
- [x] Permite editar dados do scraping (nome, preço)
- **Testes:**
  - [x] Renderiza preview com dados do scraping
  - [x] Campos editáveis funcionam
  - [x] Quantidade mínimo 1

### 2.4.3 Step 3: Resumo de custos
- [x] Valor do produto: ¥ e R$ (cotação do dia)
- [x] Taxa de serviço: % configurável
- [x] Taxa fixa por pedido: valor configurável
- [x] Total em R$
- **Testes:**
  - [x] Cálculo correto: `(priceJpy * rate) + (priceJpy * rate * serviceFee%) + fixedFee`
  - [x] Exibe valores formatados em BRL e JPY
  - [x] Recalcula ao mudar quantidade

### 2.4.4 Step 4: Pagamento
- [x] Opção 1: Débito da carteira (se saldo suficiente)
- [x] Opção 2: Pix direto (gera QR Code)
- [x] Botão "Confirmar pedido"
- **Testes:**
  - [x] Débito da carteira só habilitado se saldo >= total
  - [x] Pix gera QR Code
  - [x] Pedido criado com status AWAITING_PURCHASE após pagamento

---

## TASK 2.5 — Integração Mercado Pago (Pix)

### 2.5.1 Configurar SDK
- [x] Instalar `mercadopago`
- [x] Criar `src/lib/mercadopago/client.ts`
- [x] Configurar access token via env var
- **Teste:** Client inicializa corretamente

### 2.5.2 API Route: Gerar cobrança Pix
- [x] `POST /api/payments/pix` — recebe amount, description, referenceId
- [x] Cria cobrança no Mercado Pago
- [x] Retorna QR Code (base64) + código copia-e-cola + paymentId
- **Testes:**
  - [x] Gera cobrança com valor correto (mock SDK)
  - [x] Retorna QR Code e código
  - [x] Valor inválido (<=0) retorna erro 422

### 2.5.3 Webhook de confirmação
- [x] `POST /api/webhooks/mercadopago`
- [x] Validar assinatura HMAC
- [x] Processar evento `payment.approved`
- [x] Atualizar status do pedido ou crédito na carteira
- [x] Criar transação no extrato
- **Testes:**
  - [x] Assinatura válida processa pagamento
  - [x] Assinatura inválida retorna 401
  - [x] Pagamento duplicado é ignorado (idempotência)
  - [x] Credita carteira corretamente
  - [x] Confirma pedido corretamente

---

## TASK 2.6 — Tela da Carteira

### 2.6.1 Saldo e adicionar créditos
- [x] Card com saldo em destaque (R$)
- [x] Botão "Adicionar créditos" → input de valor + gera Pix
- [x] QR Code modal com timer de expiração
- **Testes:**
  - [x] Exibe saldo formatado corretamente
  - [x] Valor mínimo para adição (R$ 10)
  - [x] QR Code renderiza no modal

### 2.6.2 Extrato
- [x] Lista de transações com filtros: tipo, período
- [x] Cada item: data, tipo (badge colorido), descrição, valor (+/-), saldo após
- [x] Paginação ou infinite scroll
- **Testes:**
  - [x] Renderiza transações corretamente
  - [x] Filtro por tipo funciona
  - [x] Valores positivos em verde, negativos em vermelho
  - [x] Paginação carrega mais itens

---

## TASK 2.7 — Tela "Meus Pedidos"

### 2.7.1 Lista de pedidos
- [x] Cards com: foto, nome, status (badge), data, valor
- [x] Filtro por status
- [x] Ordenação por data (mais recente primeiro)
- **Testes:**
  - [x] Renderiza pedidos do usuário
  - [x] Badge correto para cada status
  - [x] Filtro funciona

### 2.7.2 Detalhes do pedido
- [x] Modal ou página com informações completas
- [x] Timeline visual de status
- [x] Botão "Cancelar" (apenas status AWAITING_PURCHASE — RN10)
- **Testes:**
  - [x] Exibe todos os dados do pedido
  - [x] Timeline marca status atual
  - [x] Cancelar visível apenas em AWAITING_PURCHASE
  - [x] Cancelar reembolsa carteira

### 2.7.3 Server Action: cancelar pedido
- [x] Validar que status é AWAITING_PURCHASE
- [x] Reembolsar valor na carteira
- [x] Criar transação de reembolso
- [x] Atualizar status para CANCELLED
- **Testes:**
  - [x] Cancelamento válido reembolsa e atualiza status
  - [x] Cancelamento em status != AWAITING_PURCHASE retorna erro
  - [x] Transação de reembolso criada corretamente

---

## Validators Zod — Sprint 2

- [x] `order-create.schema.ts` — URL, quantidade, variação, notas
- [x] `product-url.schema.ts` — valida URL + domínio aceito
- [x] `payment-pix.schema.ts` — amount > 0, description
- [x] `wallet-add-credit.schema.ts` — amount >= 10
- [x] `exchange-rate.schema.ts` — valida resposta da API de câmbio

**Cada schema:** testes com input válido, cada tipo inválido, mensagens pt-BR
