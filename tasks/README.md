# 📋 TASKS — NipponBox (JP → BR Proxy Shopping)

**Total de Sprints:** 6 (~12 semanas)
**Meta de cobertura:** 100% (statements, branches, functions, lines)

---

## Índice de Tasks por Sprint

| Sprint | Arquivo | Tasks | Foco |
|--------|---------|-------|------|
| 1 | [TASK-01-FUNDACAO.md](./TASK-01-FUNDACAO.md) | 1.1–1.14 | Setup, Auth, Landing, Design System |
| 2 | [TASK-02-PEDIDOS.md](./TASK-02-PEDIDOS.md) | 2.1–2.7 | Pedidos, Pix, Carteira, Scraping |
| 3 | [TASK-03-ARMAZEM-ENVIOS.md](./TASK-03-ARMAZEM-ENVIOS.md) | 3.1–3.7 | Armazém, Serviços Extras, Envio Consolidado |
| 4 | [TASK-04-ADMIN-CORE.md](./TASK-04-ADMIN-CORE.md) | 4.1–4.6 | Dashboard Admin, Filas, Armazém, Expedição |
| 5 | [TASK-05-FINANCEIRO-SUPORTE.md](./TASK-05-FINANCEIRO-SUPORTE.md) | 5.1–5.8 | Financeiro, Suporte, Notificações, Configurações |
| 6 | [TASK-06-POLISH-TESTES-DEPLOY.md](./TASK-06-POLISH-TESTES-DEPLOY.md) | 6.1–6.15 | Responsividade, Acessibilidade, E2E, Deploy |

---

## Estratégia de Testes (100% Coverage)

### Ferramentas
| Ferramenta | Tipo | Uso |
|------------|------|-----|
| **Vitest** | Unitário | Validators Zod, cálculos, utils, regras de negócio |
| **Testing Library** | Componente | Componentes React, formulários, interações |
| **MSW** | Mock | APIs externas (ViaCEP, AwesomeAPI, Mercado Pago, Resend) |
| **Playwright** | E2E | Fluxos completos cliente + admin |

### Regras
1. **Todo componente** tem teste de renderização + interação + acessibilidade
2. **Todo schema Zod** tem teste válido + cada tipo de inválido + mensagens pt-BR
3. **Todo Server Action** tem teste de sucesso + cada caso de erro + validação
4. **Todo cálculo** tem teste com edge cases (zero, limites de faixa, overflow)
5. **Toda regra de negócio (RN01-RN10)** tem teste dedicado
6. **Todo webhook** tem teste de assinatura válida/inválida + idempotência
7. **Todo cron job** tem teste de execução + idempotência + fallback

### Cobertura por Camada
| Camada | Tipo de Teste | Meta |
|--------|--------------|------|
| `src/lib/validators/` | Unitário | 100% |
| `src/lib/utils/` | Unitário | 100% |
| `src/components/` | Componente | 100% |
| `src/app/api/` | Integração | 100% |
| `src/app/**/actions.ts` | Integração | 100% |
| Fluxos críticos | E2E | 100% dos fluxos definidos |

---

## Regras de Negócio Cobertas

| RN | Descrição | Sprint | Task |
|----|-----------|--------|------|
| RN01 | Email confirmado para dashboard | 1 | 1.9.2 |
| RN02 | Pagamento confirmado para pedido | 2 | 2.4.4 |
| RN03 | Saldo não negativa | 2 | 2.1.2 |
| RN04 | Aceite registra IP/timestamp/versão | 3 | 3.5.3 |
| RN05 | Seguro bloqueado em declaração manual | 3 | 3.5.3 |
| RN06 | Cobrança automática diária | 5 | 5.7.1 |
| RN07 | Crédito/débito manual exige motivo | 5 | 5.4.3 |
| RN08 | Fotos obrigatórias no recebimento | 4 | 4.3.2 |
| RN09 | Cotação diária ¥/R$ | 2 | 2.2.1 |
| RN10 | Cancelamento só em AWAITING_PURCHASE | 2 | 2.7.3 |

---

## Dependências entre Sprints

```
Sprint 1 (Fundação)
    └──→ Sprint 2 (Pedidos + Pagamento)
              └──→ Sprint 3 (Armazém + Envios)
                        └──→ Sprint 4 (Admin Core)
                                  └──→ Sprint 5 (Financeiro + Suporte)
                                            └──→ Sprint 6 (Polish + Deploy)
```

---

## Definição de Pronto (DoD)

Cada subtask só é "done" quando:
- ✅ Código implementado e funcionando
- ✅ Testes unitários passando (coverage 100%)
- ✅ Validação Zod aplicada (se input)
- ✅ RLS policy aplicada (se acesso ao DB)
- ✅ Responsivo (mobile + desktop)
- ✅ Sem erros no console
- ✅ Deploy preview sem erros
- ✅ Acessibilidade verificada (aria, keyboard nav)
