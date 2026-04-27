# SPRINT.md — Planejamento de Sprints

**Projeto:** Serviço de Compras e Redirecionamento JP → BR  
**Versão:** 1.0  
**Data:** Abril 2026  
**Metodologia:** Sprints de 2 semanas  
**Total estimado:** 6 sprints (~12 semanas)  

---

## Visão Geral

```
Sprint 1 ──── Fundação (Infra + Auth + Landing)
Sprint 2 ──── Pedidos (Fluxo de compra + Pagamento Pix)
Sprint 3 ──── Armazém + Envios (Consolidação + Frete)
Sprint 4 ──── Admin Core (Painel + Compras + Armazém + Expedição)
Sprint 5 ──── Financeiro + Suporte + Notificações
Sprint 6 ──── Polish + Testes + Deploy Produção
```

---

## Sprint 1 — Fundação (Semanas 1–2)

**Objetivo:** Infraestrutura funcional, autenticação completa e landing page publicada.

**Entregável:** Usuário consegue acessar o site, se cadastrar, confirmar email e ver o dashboard vazio.

### Tarefas

| # | Tarefa | Prioridade | Estimativa |
|---|---|---|---|
| 1.1 | Setup do projeto Next.js 15 + TypeScript + ESLint + Prettier | Alta | 2h |
| 1.2 | Configurar Supabase (projeto, Auth, Database, Storage) | Alta | 3h |
| 1.3 | Configurar Prisma + schema inicial (User, Address) | Alta | 4h |
| 1.4 | Implementar design system CSS (tokens, cores, tipografia, componentes base) | Alta | 8h |
| 1.5 | Componentes UI base: Button, Input, Modal, Card, Badge, Sidebar | Alta | 8h |
| 1.6 | Landing page: hero, como funciona (steps), plataformas aceitas, FAQ, footer | Alta | 12h |
| 1.7 | Calculadora de frete estimado (sem login) | Média | 4h |
| 1.8 | Cadastro: formulário com validação (CPF, CEP via ViaCEP, email) | Alta | 8h |
| 1.9 | Login + logout + middleware de proteção de rotas | Alta | 6h |
| 1.10 | Confirmação de email (fluxo Supabase Auth) | Alta | 3h |
| 1.11 | Layout do dashboard do cliente (sidebar + topbar + área de conteúdo) | Alta | 6h |
| 1.12 | Layout do painel admin (sidebar separada, role check) | Alta | 4h |
| 1.13 | Deploy inicial na Vercel + variáveis de ambiente | Alta | 2h |
| 1.14 | Configurar Resend + template de email de boas-vindas | Média | 3h |

**Total estimado:** ~73h

### Critérios de Aceite
- [ ] Landing page publicada na Vercel com design premium
- [ ] Cadastro com validação de CPF e preenchimento automático de CEP
- [ ] Confirmação de email funcional
- [ ] Login/logout com sessão persistente
- [ ] Dashboard do cliente renderiza com sidebar (conteúdo placeholder)
- [ ] Rota `/admin` bloqueada para não-admins
- [ ] Calculadora de frete estimado funcional na landing

---

## Sprint 2 — Pedidos + Pagamento (Semanas 3–4)

**Objetivo:** Fluxo completo de criação de pedido, pagamento via Pix e carteira.

**Entregável:** Cliente consegue criar um pedido a partir de uma URL JP, pagar via Pix, e ver o status atualizado.

### Dependências
- Sprint 1 concluída (auth + layout + DB base)

### Tarefas

| # | Tarefa | Prioridade | Estimativa |
|---|---|---|---|
| 2.1 | Schema Prisma: Order, OrderItem, Wallet, Transaction | Alta | 4h |
| 2.2 | Migration + RLS policies para pedidos e carteira | Alta | 3h |
| 2.3 | API Route: scraping de produto JP (Cheerio + fetch) | Alta | 8h |
| 2.4 | Fallback: formulário manual quando scraping falha | Alta | 4h |
| 2.5 | Tela de criação de pedido (URL input → preview → custos → confirmar) | Alta | 12h |
| 2.6 | Cálculo de custos: produto ¥→R$ + taxa de serviço + taxa fixa | Alta | 4h |
| 2.7 | Integração AwesomeAPI: cotação diária ¥/R$ + cron job | Alta | 4h |
| 2.8 | Integração Mercado Pago: geração de cobrança Pix + QR Code | Alta | 8h |
| 2.9 | Webhook do Mercado Pago: confirmação de pagamento | Alta | 6h |
| 2.10 | Carteira: tela de saldo + adicionar créditos via Pix | Alta | 6h |
| 2.11 | Carteira: extrato com filtros por tipo de transação | Média | 4h |
| 2.12 | Tela "Meus Pedidos": lista com status visual + detalhes | Alta | 6h |
| 2.13 | Cancelamento de pedido (apenas status "Aguardando Compra" — RN10) | Média | 3h |
| 2.14 | Validação: saldo não pode ficar negativo (RN03) | Alta | 2h |

**Total estimado:** ~74h

### Critérios de Aceite
- [ ] Scraping funcional para ao menos Amazon JP e Mercari
- [ ] Fallback manual funciona quando scraping falha
- [ ] Cálculo de custos exibido corretamente (¥ e R$)
- [ ] Pagamento Pix gera QR Code funcional
- [ ] Webhook confirma pagamento e atualiza status automaticamente
- [ ] Carteira mostra saldo, permite adição de créditos e exibe extrato
- [ ] Pedidos listados com estados visuais corretos
- [ ] Cancelamento bloqueado após status "Aguardando Compra"

---

## Sprint 3 — Armazém + Envios (Semanas 5–6)

**Objetivo:** Gestão de itens no armazém, serviços extras e fluxo completo de envio com consolidação.

**Entregável:** Cliente vê itens no armazém, solicita serviços extras, seleciona itens, cria envio consolidado e paga.

### Dependências
- Sprint 2 concluída (pedidos + pagamento)

### Tarefas

| # | Tarefa | Prioridade | Estimativa |
|---|---|---|---|
| 3.1 | Schema Prisma: WarehouseItem, Shipment, ShipmentItem, ExtraService | Alta | 4h |
| 3.2 | Migration + RLS policies para armazém e envios | Alta | 3h |
| 3.3 | Tela do Armazém (cliente): lista de itens, fotos, peso, volume, prazo | Alta | 8h |
| 3.4 | Indicadores visuais: prazo de armazenamento (barra de progresso + alerta) | Alta | 4h |
| 3.5 | Serviços extras: botões por item (foto extra, quality check, remoção de embalagem, proteção) | Alta | 6h |
| 3.6 | Solicitação de serviço extra + débito na carteira | Alta | 4h |
| 3.7 | Seleção de itens para envio (checkboxes + resumo) | Alta | 4h |
| 3.8 | Fluxo de criação de envio — Step 1: resumo dos itens (peso total + dimensões) | Alta | 4h |
| 3.9 | Step 2: escolha do método de frete (SAL, EMS, DHL, FedEx) com custos | Alta | 6h |
| 3.10 | Step 3: seguro opcional + declaração aduaneira (real vs manual) | Alta | 8h |
| 3.11 | Modal de aceite de responsabilidade (declaração manual): texto + checkbox + gravação IP/timestamp (RN04) | Alta | 4h |
| 3.12 | Bloqueio de seguro em declaração manual (RN05) | Alta | 2h |
| 3.13 | Step 4: seleção de endereço de entrega (cadastrados ou novo) | Alta | 4h |
| 3.14 | Step 5: resumo final + pagamento (carteira ou Pix) | Alta | 6h |
| 3.15 | Tela "Meus Envios": lista com status visual + código de rastreio | Alta | 6h |
| 3.16 | Confirmação de entrega pelo cliente | Média | 3h |

**Total estimado:** ~76h

### Critérios de Aceite
- [ ] Itens do armazém exibidos com fotos, peso, dimensões e prazo restante
- [ ] Alerta visual quando prazo de armazenamento está próximo
- [ ] Serviços extras podem ser solicitados e são debitados da carteira
- [ ] Seleção de múltiplos itens para consolidação funcional
- [ ] Wizard de envio com 5 steps completos
- [ ] Declaração manual grava aceite com IP + timestamp + user_id
- [ ] Seguro bloqueado quando declaração é manual
- [ ] Envio criado com pagamento confirmado
- [ ] Status do envio atualizado visualmente

---

## Sprint 4 — Admin Core (Semanas 7–8)

**Objetivo:** Painel administrativo funcional para operação diária — compras, armazém e expedição.

**Entregável:** Admin consegue processar o fluxo completo: comprar → receber no armazém → expedir.

### Dependências
- Sprint 3 concluída (armazém + envios existem no DB)

### Tarefas

| # | Tarefa | Prioridade | Estimativa |
|---|---|---|---|
| 4.1 | Dashboard admin: KPIs em cards (pedidos pendentes, itens no armazém, envios prontos, chamados, receita do mês) | Alta | 8h |
| 4.2 | Fila de Compras: lista de pedidos "Aguardando Compra" com link, variações, observações | Alta | 6h |
| 4.3 | Ação "Marcar como Comprado": valor real ¥, previsão de chegada, upload de comprovante | Alta | 6h |
| 4.4 | Recebimento no Armazém: busca de pedido + upload obrigatório de 2-3 fotos | Alta | 8h |
| 4.5 | Informar peso real (g) e dimensões (cm) | Alta | 3h |
| 4.6 | Quality Check: registro de resultado + foto de problema (se houver) | Alta | 4h |
| 4.7 | Notificação ao cliente quando item chega no armazém | Alta | 3h |
| 4.8 | Expedição: lista de envios "Preparando Pacote" com detalhes completos | Alta | 6h |
| 4.9 | Flag visual para declaração manual no envio | Alta | 2h |
| 4.10 | Ação "Marcar como Enviado": código de rastreio + peso final | Alta | 4h |
| 4.11 | Notificação automática com código de rastreio ao cliente | Alta | 3h |
| 4.12 | Gestão do Armazém (admin): todos os itens, filtros por cliente/data/prazo | Alta | 6h |
| 4.13 | Alertas automáticos: 7 dias antes do prazo, prazo vencido, 90 dias sem envio | Alta | 6h |
| 4.14 | Ações manuais: prorrogar prazo, iniciar cobrança, contatar cliente | Média | 4h |
| 4.15 | Atualização manual de status de envio (Em Trânsito, No Brasil, etc.) | Alta | 4h |
| 4.16 | Log de auditoria: todas as ações admin com user_id + timestamp | Alta | 4h |

**Total estimado:** ~77h

### Critérios de Aceite
- [ ] Dashboard com KPIs em tempo real
- [ ] Fila de compras funcional com ação de marcar como comprado
- [ ] Recebimento no armazém com upload obrigatório de fotos
- [ ] Expedição com inserção de código de rastreio
- [ ] Notificações automáticas ao cliente em cada mudança de status
- [ ] Gestão de armazém com filtros e alertas de prazo
- [ ] Flag visual clara em envios com declaração manual
- [ ] Log de auditoria registrando todas as ações administrativas

---

## Sprint 5 — Financeiro + Suporte + Notificações (Semanas 9–10)

**Objetivo:** Módulos financeiros, sistema de suporte e notificações completos.

**Entregável:** Admin tem controle financeiro completo, clientes podem abrir chamados, sistema de notificações funcional.

### Dependências
- Sprint 4 concluída (admin base funcional)

### Tarefas

| # | Tarefa | Prioridade | Estimativa |
|---|---|---|---|
| 5.1 | Schema Prisma: Ticket, TicketMessage | Alta | 3h |
| 5.2 | Suporte (cliente): abertura de chamado vinculado a pedido/envio | Alta | 6h |
| 5.3 | Tipos de chamado: problema com item, rastreio, cobrança, outro | Alta | 2h |
| 5.4 | Upload de até 5 fotos por chamado (Supabase Storage) | Alta | 4h |
| 5.5 | Histórico de chamados com status visual (Aberto → Em Análise → Resolvido) | Alta | 4h |
| 5.6 | Suporte (admin): lista de chamados, detalhes, resposta | Alta | 6h |
| 5.7 | Notificação ao cliente a cada mudança de status e nova resposta | Alta | 3h |
| 5.8 | Admin — Clientes: lista com busca, perfil completo (dados, saldo, histórico) | Alta | 6h |
| 5.9 | Admin — Crédito/débito manual na carteira (com motivo obrigatório — RN07) | Alta | 4h |
| 5.10 | Admin — Bloquear conta + visualizar aceites registrados | Média | 3h |
| 5.11 | Admin — Financeiro: receita por período (taxas, frete, extras, armazenamento) | Alta | 8h |
| 5.12 | Admin — Financeiro: custos (compras reais ¥, fretes reais, operacionais) | Alta | 6h |
| 5.13 | Admin — Financeiro: saldo total em carteira (passivo) | Alta | 3h |
| 5.14 | Admin — Exportar relatório CSV e PDF | Média | 6h |
| 5.15 | Admin — Configurações: taxas, preços de frete, prazo armazenamento, serviços extras | Alta | 6h |
| 5.16 | Admin — Configurações: plataformas aceitas, produtos proibidos, texto de termos | Alta | 4h |
| 5.17 | Cobrança automática de armazenamento após prazo (Edge Function cron) | Alta | 6h |
| 5.18 | Email templates completos (React Email): todos os gatilhos do PRD | Alta | 8h |

**Total estimado:** ~88h

### Critérios de Aceite
- [ ] Cliente pode abrir chamado vinculado a pedido/envio com fotos
- [ ] Admin pode responder chamados e alterar status
- [ ] Módulo financeiro mostra receita, custos e saldos de carteira
- [ ] Exportação CSV/PDF funcional
- [ ] Configurações editáveis pelo admin (taxas, prazos, preços, textos)
- [ ] Cobrança automática de armazenamento funcional
- [ ] Todos os emails transacionais disparando nos gatilhos corretos
- [ ] Crédito/débito manual exige motivo registrado

---

## Sprint 6 — Polish + Testes + Deploy (Semanas 11–12)

**Objetivo:** Qualidade de produção — testes, performance, responsividade, acessibilidade e deploy final.

**Entregável:** Sistema completo pronto para usuários reais.

### Dependências
- Sprints 1–5 concluídas

### Tarefas

| # | Tarefa | Prioridade | Estimativa |
|---|---|---|---|
| 6.1 | Responsividade: ajustar todas as telas para mobile/tablet | Alta | 12h |
| 6.2 | Acessibilidade: ARIA labels, navegação por teclado, contraste | Alta | 6h |
| 6.3 | SEO: meta tags, Open Graph, sitemap, robots.txt | Alta | 4h |
| 6.4 | Performance: otimização de imagens (next/image), lazy loading, code splitting | Alta | 6h |
| 6.5 | Testes E2E: fluxo completo do cliente (cadastro → pedido → pagamento → envio) | Alta | 12h |
| 6.6 | Testes E2E: fluxo do admin (compra → recebimento → expedição) | Alta | 8h |
| 6.7 | Testes unitários: validações Zod, cálculos de frete/câmbio, regras de negócio | Alta | 8h |
| 6.8 | Testes de integração: webhooks de pagamento, scraping, cotação | Alta | 6h |
| 6.9 | Error boundaries e páginas de erro customizadas (404, 500) | Alta | 4h |
| 6.10 | Loading states e skeletons em todas as telas | Alta | 6h |
| 6.11 | Página de política de privacidade (LGPD) | Alta | 3h |
| 6.12 | Endpoint de exclusão de dados do usuário (LGPD) | Alta | 4h |
| 6.13 | Configurar Sentry para error tracking | Média | 3h |
| 6.14 | Configurar Uptime Robot | Média | 1h |
| 6.15 | Revisão de segurança: rate limiting, RLS policies, headers HTTP | Alta | 6h |
| 6.16 | Deploy de produção: domínio final, DNS, certificado SSL | Alta | 3h |
| 6.17 | Seed data para homologação: pedidos de teste, dados fictícios | Média | 3h |
| 6.18 | Documentação operacional: como o admin usa o sistema (guia rápido) | Média | 4h |

**Total estimado:** ~99h

### Critérios de Aceite
- [ ] Todas as telas responsivas (mobile, tablet, desktop)
- [ ] Lighthouse score > 90 em performance, acessibilidade e SEO
- [ ] Testes E2E passando para fluxos críticos do cliente e admin
- [ ] Testes unitários cobrindo validações e cálculos
- [ ] Error tracking configurado (Sentry)
- [ ] Monitoramento de uptime ativo
- [ ] LGPD: política de privacidade + exclusão de dados funcional
- [ ] Rate limiting ativo em rotas críticas
- [ ] Deploy de produção no domínio final

---

## Resumo de Esforço

| Sprint | Foco | Horas Estimadas |
|---|---|---|
| Sprint 1 | Fundação (Infra + Auth + Landing) | ~73h |
| Sprint 2 | Pedidos + Pagamento | ~74h |
| Sprint 3 | Armazém + Envios | ~76h |
| Sprint 4 | Admin Core | ~77h |
| Sprint 5 | Financeiro + Suporte + Notificações | ~88h |
| Sprint 6 | Polish + Testes + Deploy | ~99h |
| **Total** | | **~487h** |

---

## Marcos (Milestones)

| Data Estimada | Marco | Validação |
|---|---|---|
| Fim da Sprint 1 | 🟢 MVP Visível | Landing publicada + auth funcional |
| Fim da Sprint 2 | 🟡 Fluxo de Compra | Pedido completo com pagamento Pix |
| Fim da Sprint 3 | 🟡 Fluxo de Envio | Consolidação + envio com pagamento |
| Fim da Sprint 4 | 🔵 Operação Admin | Admin processa pedidos de ponta a ponta |
| Fim da Sprint 5 | 🔵 Sistema Completo | Todos os módulos funcionais |
| Fim da Sprint 6 | 🟣 Produção | Deploy final, testado, pronto para usuários reais |

---

## Riscos por Sprint

| Sprint | Risco Principal | Mitigação |
|---|---|---|
| 1 | Design system mal definido impacta todas as sprints | Investir tempo adequado nos tokens + revisão visual antes de prosseguir |
| 2 | Scraping bloqueado pelos sites JP | Fallback manual já está no escopo; scraping é best-effort |
| 2 | Homologação do Mercado Pago atrasar | Iniciar credenciamento na Sprint 1; usar sandbox nos testes |
| 3 | Complexidade do wizard de envio (5 steps) | Decompor em componentes isolados; testar cada step independentemente |
| 4 | Volume de telas do admin | Reutilizar componentes da área do cliente; tabelas/formulários genéricos |
| 5 | Cron job de cobrança automática falhar silenciosamente | Logging robusto + alerta no dashboard admin |
| 6 | Escopo de polish expandir demais | Definir checklist fixo; cortar itens "nice-to-have" se necessário |

---

## Definição de Pronto (DoD)

Cada tarefa só é considerada pronta quando:

1. ✅ Código implementado e funcionando
2. ✅ Validações do Zod aplicadas (se aplicável)
3. ✅ Responsivo (mobile + desktop)
4. ✅ Sem erros no console
5. ✅ RLS policies aplicadas (se acesso ao DB)
6. ✅ Deploy de preview sem erros na Vercel

---

*Este planejamento deve ser ajustado conforme a velocidade real da equipe após a Sprint 1.*
