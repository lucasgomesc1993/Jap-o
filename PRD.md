# PRD — Serviço de Compras e Redirecionamento do Japão para o Brasil

**Versão:** 1.0  
**Data:** Abril 2026  
**Status:** Draft  

---

## 1. Visão Geral

### 1.1 Problema

Consumidores brasileiros têm acesso limitado a produtos japoneses. Comprar diretamente em sites como Amazon JP, Rakuten, Mercari ou Yahoo Auctions é complexo: barreiras de idioma, impossibilidade de envio internacional direto, incerteza sobre taxas alfandegárias e dificuldade de consolidar múltiplos itens em um único pacote.

### 1.2 Solução

Plataforma de proxy shopping e redirecionamento (reenvio) que permite ao usuário brasileiro:

1. **Solicitar a compra** de qualquer produto em sites japoneses, sem precisar de cartão internacional ou conta local;
2. **Armazenar itens** em um armazém no Japão;
3. **Consolidar e enviar** múltiplos itens juntos ao Brasil, escolhendo o método de frete mais adequado.

### 1.3 Proposta de Valor

| Para o cliente | Para o negócio |
|---|---|
| Acesso a qualquer produto japonês | Taxa de serviço sobre cada compra |
| Frete consolidado (paga menos) | Margem sobre o frete internacional |
| Rastreamento em tempo real | Serviços extras de armazém |
| Suporte em português | Cobrança por armazenamento prolongado |

---

## 2. Objetivos do Produto

| # | Objetivo | Métrica de sucesso |
|---|---|---|
| O1 | Reduzir fricção no processo de compra | Taxa de conclusão de pedido > 80% |
| O2 | Aumentar ticket médio por consolidação | Média de 2+ itens por envio |
| O3 | Minimizar chamados de suporte | < 5% de pedidos geram chamado |
| O4 | Garantir conformidade aduaneira | 0 incidentes por declaração incorreta |
| O5 | Escalabilidade operacional para o admin | Admin consegue processar 20+ pedidos/dia |

---

## 3. Usuários

### 3.1 Cliente Final (B2C)

**Perfil:** Brasileiro, 18–40 anos, entusiasta de cultura japonesa (games, anime, moda, tecnologia, cosméticos). Tem familiaridade com e-commerce, mas não fala japonês e não tem cartão internacional.

**Necessidades principais:**
- Comprar produtos exclusivos do Japão com segurança
- Pagar em real (Pix ou cartão)
- Acompanhar cada etapa do pedido
- Consolidar itens para reduzir frete

### 3.2 Administrador Operacional

**Perfil:** Operador da empresa, baseado no Japão (ou com acesso ao armazém). Responsável por comprar, receber, fotografar, embalar e despachar os pedidos.

**Necessidades principais:**
- Fila clara de tarefas por prioridade
- Registro de peso, dimensões e fotos de cada item
- Controle financeiro de compras reais vs. valores cobrados
- Gestão de clientes e chamados de suporte

---

## 4. Escopo do MVP

### 4.1 Dentro do escopo

- Cadastro e autenticação de clientes (email + confirmação)
- Solicitação de pedido via URL de produto japonês
- Scraping básico de foto, nome e preço do produto
- Cálculo de custos (taxa de serviço + taxa fixa)
- Pagamento via Pix e carteira interna
- Fluxo completo de status do pedido (6 estados)
- Tela de Armazém (itens físicos no JP)
- Serviços extras: foto, quality check, remoção de embalagem, proteção
- Criação de envio com consolidação de itens
- Escolha de método de frete (EMS, SAL, DHL, FedEx)
- Declaração aduaneira (real ou manual com aceite registrado)
- Rastreamento de envio (7 estados)
- Carteira com extrato completo
- Suporte via chamados vinculados a pedidos/envios
- Painel administrativo completo (compras, armazém, expedição, financeiro)
- Notificações por email (e push, se app mobile)

### 4.2 Fora do escopo (pós-MVP)

- App mobile nativo
- Integração automática com APIs de transportadoras (rastreio automático)
- Scraping avançado com fallback para múltiplos sites
- Programa de fidelidade / cashback
- Multi-idioma (EN/JA)
- Pagamento via cartão de crédito (parcelado)
- API pública para parceiros

---

## 5. Funcionalidades Detalhadas

### 5.1 Onboarding e Autenticação

**Cadastro**
- Campos: nome completo, email, senha, CPF, telefone, endereço completo (CEP com preenchimento automático via ViaCEP)
- Validação de CPF (formato e dígito verificador)
- Confirmação de email obrigatória antes de acessar o dashboard

**Landing Page**
- Explicação do serviço em etapas visuais
- Plataformas aceitas (lista configurável pelo admin)
- Calculadora de frete estimado (sem login)
- FAQ básico
- Produtos proibidos (lista configurável pelo admin)

---

### 5.2 Pedidos

**Criação de pedido**
- Input de URL do produto
- Tentativa de scraping: foto, nome, preço em ¥
- Fallback: campos manuais se o scraping falhar
- Campos adicionais: quantidade, variação (cor/tamanho), observações
- Resumo de custos:
  - Valor do produto (¥ e R$ pela cotação do dia)
  - Taxa de serviço (% configurável pelo admin)
  - Taxa fixa por pedido (configurável pelo admin)
  - Total a pagar em R$
- Pagamento: débito da carteira ou Pix direto (geração de QR Code)

**Estados do pedido**

```
Aguardando Compra
    → Comprado no Japão
    → Em Trânsito para o Armazém JP
    → No Armazém
```

---

### 5.3 Armazém

**Visão do cliente**
- Lista de todos os itens físicos no armazém
- Por item: foto(s), nome, peso, volume (C×L×A), data de chegada, prazo de armazenamento gratuito, dias restantes
- Indicador visual de alerta quando prazo está próximo

**Serviços extras (por item)**

| Serviço | Valor |
|---|---|
| Foto extra (abertura de caixa) | R$ 5 / foto |
| Quality Check (verificação de defeitos) | R$ 10 / item |
| Remoção de embalagem (reduz peso) | R$ 5 / item |
| Proteção extra (bolha/reforço) | R$ 8 / item |

*Preços configuráveis pelo admin.*

**Seleção para envio**
- Checkbox para selecionar 1 ou mais itens
- Botão "Criar Envio" ativa o fluxo de consolidação

---

### 5.4 Criação de Envio (Consolidação)

1. Resumo dos itens selecionados (peso total + dimensões calculadas)
2. Escolha do método de frete:

| Método | Prazo estimado | Custo relativo |
|---|---|---|
| SAL | ~45 dias | $ |
| EMS | ~15 dias | $$$ |
| DHL | ~5 dias | $$$$ |
| FedEx | ~5 dias | $$$$ |

3. Seguro opcional (desabilitado se declaração manual)
4. Declaração aduaneira:
   - **Opção A:** Valor real (recomendado) — preenchido automaticamente
   - **Opção B:** Valor manual — exibe modal com texto de responsabilidade (configurável pelo admin), requer checkbox obrigatório; aceite é gravado com IP + timestamp + ID do usuário
5. Endereço de entrega (seleção entre endereços cadastrados ou novo)
6. Resumo final: itens + frete + seguro + serviços extras
7. Pagamento: carteira ou Pix

**Estados do envio**

```
Preparando Pacote
    → Enviado do Japão (código de rastreio liberado)
    → Em Trânsito Internacional
    → Chegou no Brasil
    → Saiu para Entrega
    → Entregue (cliente confirma)
```

---

### 5.5 Carteira

- Saldo disponível em destaque
- Adicionar créditos: Pix (QR Code) ou cartão (pós-MVP)
- Extrato completo com filtros por tipo:
  - Créditos adicionados
  - Pedidos pagos
  - Fretes pagos
  - Serviços extras
  - Cobranças de armazenamento

---

### 5.6 Suporte

**Cliente**
- Abertura de chamado vinculado a pedido ou envio específico
- Tipos: problema com item, rastreio, cobrança, outro
- Upload de até 5 fotos por chamado
- Histórico de chamados com status visual

**Estados do chamado**

```
Aberto → Em Análise → Resolvido
```

- Notificação ao cliente a cada mudança de status e nova resposta do admin

---

### 5.7 Painel Administrativo

#### Dashboard
- KPIs em tempo real: pedidos aguardando compra, itens no armazém, envios prontos para despacho, chamados abertos, receita do mês
- Alertas: prazos de armazenamento vencendo, pagamentos pendentes

#### Fila de Compras
- Lista de pedidos no status "Aguardando Compra", ordenados por data
- Abertura de pedido: link do produto, variações, observações, valor cobrado do cliente
- Ação "Marcar como Comprado":
  - Valor real pago em ¥
  - Previsão de chegada no armazém
  - Upload de comprovante (print/PDF)
- Status muda para "Em Trânsito para o Armazém"

#### Recebimento no Armazém
- Busca de pedido (nome, código ou cliente)
- Upload de 2–3 fotos obrigatório
- Informar peso real (g) e dimensões (cm)
- Se havia Quality Check: registrar resultado + foto de problema (se houver)
- Confirmação: item aparece no armazém do cliente + notificação enviada

#### Expedição
- Lista de envios pagos no status "Preparando Pacote"
- Detalhes: itens, método de frete, valor declarado (⚠️ flag visual se manual), endereço de destino
- Ação "Marcar como Enviado":
  - Código de rastreio
  - Peso final real
- Notificação automática ao cliente com código de rastreio

#### Gestão do Armazém
- Visão de todos os itens físicos (todos os clientes)
- Filtros: cliente, data de chegada, prazo vencendo
- Alertas automáticos:
  - 7 dias antes do fim do período gratuito → notifica cliente
  - Prazo vencido → cobrança automática por dia
  - Item sem envio há 90 dias → alerta crítico
- Ações manuais: prorrogar prazo, iniciar cobrança, contatar cliente

#### Clientes
- Lista com busca
- Perfil: dados cadastrais, saldo, histórico de pedidos/envios, chamados, aceites registrados
- Ações: adicionar/remover crédito manualmente (com campo de motivo obrigatório), bloquear conta, visualizar declarações aceitas

#### Financeiro
- Receita por período: taxas de serviço, margem de frete, serviços extras, armazenamento cobrado
- Custos: compras reais em ¥ (convertido para R$), fretes reais pagos, outros custos operacionais
- Saldos em carteira (passivo total dos clientes)
- Exportar relatório (CSV e PDF)

#### Configurações
- Taxa de serviço (% e valor fixo por pedido)
- Tabela de preços de frete por método e faixa de peso
- Prazo de armazenamento gratuito (dias)
- Valor de cobrança por dia após prazo (R$)
- Preços dos serviços extras
- Plataformas aceitas (lista de domínios JP)
- Produtos proibidos (lista visível ao cliente)
- Texto dos termos de responsabilidade (declaração manual)

---

## 6. Regras de Negócio

| # | Regra |
|---|---|
| RN01 | O usuário só acessa o dashboard após confirmar o email |
| RN02 | Pedido só é criado após confirmação de pagamento (Pix ou saldo suficiente) |
| RN03 | Saldo da carteira não pode ficar negativo |
| RN04 | Aceite de declaração manual deve registrar: user_id, IP, timestamp, versão do texto |
| RN05 | Seguro não pode ser ativado em envios com declaração manual |
| RN06 | Após o prazo gratuito, a cobrança de armazenamento é automática e diária |
| RN07 | Todo crédito/débito manual na carteira exige motivo registrado pelo admin |
| RN08 | Fotos do armazém são obrigatórias para confirmar recebimento de um item |
| RN09 | Cotação ¥/R$ é atualizada diariamente (fonte: API de câmbio pública) |
| RN10 | O cliente pode cancelar um pedido apenas enquanto estiver no status "Aguardando Compra" |

---

## 7. Requisitos Não Funcionais

| Categoria | Requisito |
|---|---|
| **Segurança** | Senhas com hash bcrypt; HTTPS obrigatório; dados de CPF e endereço criptografados em repouso |
| **LGPD** | Coleta mínima de dados; política de privacidade; opção de exclusão de conta |
| **Disponibilidade** | SLA de 99,5% (exceto janelas de manutenção agendadas) |
| **Performance** | Tempo de resposta < 2s para 95% das requisições |
| **Escalabilidade** | Arquitetura preparada para escalar horizontalmente |
| **Auditoria** | Log de todas as ações administrativas com user_id + timestamp |
| **Pagamentos** | Integração com gateway certificado PCI DSS (ex.: Mercado Pago, PagSeguro) |
| **Uploads** | Armazenamento de fotos em object storage (ex.: S3 ou equivalente) |

---

## 8. Notificações

| Gatilho | Canal | Destinatário |
|---|---|---|
| Pedido criado | Email | Cliente |
| Pedido marcado como Comprado | Email + Push | Cliente |
| Item chegou no armazém | Email + Push | Cliente |
| 7 dias antes do fim do prazo gratuito | Email + Push | Cliente |
| Prazo de armazenamento vencido | Email | Cliente |
| Envio criado e pago | Email | Cliente |
| Código de rastreio disponível | Email + Push | Cliente |
| Resposta no chamado de suporte | Email + Push | Cliente |
| Novo pedido na fila | Email / notif. interna | Admin |
| Item recebido no armazém (pronto p/ expedir) | Notif. interna | Admin |
| Chamado de suporte aberto | Notif. interna | Admin |

---

## 9. Fluxos de Status (Resumo)

| Entidade | Estados |
|---|---|
| **Pedido** | Aguardando Compra → Comprado → Em Trânsito para Armazém → No Armazém |
| **Item no Armazém** | Disponível → Selecionado para Envio → Enviado |
| **Envio** | Preparando Pacote → Enviado → Em Trânsito → No Brasil → Saiu p/ Entrega → Entregue |
| **Chamado** | Aberto → Em Análise → Resolvido |

---

## 10. Integrações Externas

| Sistema | Finalidade | Criticidade |
|---|---|---|
| ViaCEP | Preenchimento automático de endereço por CEP | Alta |
| API de câmbio (ex.: AwesomeAPI) | Cotação diária ¥/R$ | Alta |
| Gateway de pagamento (Pix) | Recebimento e geração de QR Code | Alta |
| Object storage (S3 ou similar) | Armazenamento de fotos de itens | Alta |
| Serviço de email transacional (ex.: Resend, SendGrid) | Notificações por email | Alta |
| Scraper de produtos JP | Puxar foto, nome e preço via URL | Média |
| APIs de rastreio (Correios, DHL, FedEx) | Atualização automática de status de envio | Baixa (pós-MVP) |

---

## 11. Métricas de Sucesso (6 meses pós-lançamento)

| Métrica | Meta |
|---|---|
| Pedidos processados por mês | ≥ 100 |
| Taxa de conversão (cadastro → 1º pedido) | ≥ 40% |
| NPS | ≥ 50 |
| Taxa de recompra (clientes com 2+ pedidos) | ≥ 35% |
| Tempo médio de resolução de chamados | ≤ 48h |
| Receita mensal recorrente | Crescimento MoM ≥ 15% |

---

## 12. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Scraping bloqueado pelos sites JP | Alta | Médio | Formulário manual como fallback sempre disponível |
| Variação cambial impactando margens | Alta | Alto | Cotação diária + margem de segurança embutida no cálculo |
| Pacote retido na alfândega | Média | Alto | Orientações claras sobre declaração; histórico de aceite registrado |
| Prazo de entrega extrapolado | Média | Médio | Comunicação proativa de status; SLA por método de frete documentado |
| Fraude em pagamentos via Pix | Baixa | Alto | Gateway com validação de chave; limite de recarga por período |
| Sobrecarga operacional do admin | Média | Alto | Filas priorizadas; alertas automáticos; limitar pedidos/dia no MVP |

---

## 13. Próximos Passos

1. **Schema do banco de dados** — modelagem das entidades principais (User, Order, Item, Shipment, Wallet, Ticket)
2. **Protótipo de baixa fidelidade** — fluxos do cliente e do admin
3. **Definição do stack tecnológico** — frontend, backend, banco, hospedagem
4. **Setup do gateway de pagamento** — homologação do Pix
5. **Planejamento de sprints** — divisão do desenvolvimento em iterações

---

*Documento gerado com base na recapitulação funcional completa do produto. Deve ser revisado e validado pelo time antes de iniciar o desenvolvimento.*