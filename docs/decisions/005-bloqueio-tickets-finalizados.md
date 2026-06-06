# 005 — Bloqueio de alterações em tickets finalizados no backend

**Data:** 05/06/2026  
**Status:** implementado  
**Contexto:** Durante os testes do frontend refatorado (ADR 004), identificamos que o backend não bloqueava alterações de status em tickets com status `Resolvido` ou `Fechado`, apesar dessa restrição já estar definida em `RN-CICLO-01`.

## O que foi identificado

A regra `RN-CICLO-01` estabelece que tickets finalizados não aceitam novas notas nem alteração de status. O `notaController` já aplicava essa restrição corretamente — retorna `403` ao tentar adicionar uma nota a um ticket encerrado. O `ticketController`, no entanto, não tinha nenhuma verificação equivalente em `updateStatusTicket`.

Na prática, isso significava que qualquer usuário autenticado conseguia mover um ticket de `Resolvido` de volta para `Em atendimento` via `PATCH /tickets/:id`, contornando o ciclo de vida planejado. O frontend bloqueava visualmente o drag nesses cards, mas a API continuava aceitando a requisição.

## Decisão

Adicionar uma guarda de status em `updateStatusTicket`, logo após a verificação de existência do ticket (`404`), antes de qualquer processamento de ação. A guarda retorna `403` se o status atual do ticket for `Resolvido` ou `Fechado` — e se aplica tanto a alterações de status quanto à ação `assumir`.

## Como foi feito

Uma única adição em `ticketController.js`, logo após o bloco `if (!ticketAtual)`:

```js
const STATUS_FINALIZADOS = ['Resolvido', 'Fechado'];
if (STATUS_FINALIZADOS.includes(ticketAtual.status)) {
    return res.status(403).json({ error: "Ticket encerrado. Não é possível alterar tickets com status Resolvido ou Fechado." });
}
```

A guarda foi posicionada antes dos blocos de `acao === 'assumir'` e de alteração de status para que o bloqueio seja aplicado de forma centralizada, sem precisar duplicá-lo em cada ramificação do controller.

## O que aprendi

- A regra de negócio já existia documentada e parcialmente implementada (no notaController), mas a implementação incompleta não é visível olhando só o código — só aparece quando você testa um caminho específico ou compara o comportamento com o documento de regras.
- O frontend pode — e deve — bloquear ações proibidas na interface, mas isso é uma camada de UX, não de segurança. A API precisa ser a fonte de verdade, porque qualquer cliente (Cypress, curl, Postman) pode chamar o endpoint diretamente ignorando o frontend.
- A posição da guarda importa: colocar antes das ramificações evita que a regra precise ser replicada em cada `if`. Uma verificação centralizada é mais fácil de encontrar e de auditar.

## Referências

- `packages/backend/src/controllers/ticketController.js`
- `docs/regras-de-negocio.md` — RN-CICLO-01
- `docs/contrato-api.md` — `PATCH /tickets/:ticketId`
- `docs/decisions/004-refatoracao-frontend-react.md`
