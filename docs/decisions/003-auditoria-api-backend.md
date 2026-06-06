# 001 — Auditoria de segurança e qualidade da API

**Data:** 05/06/2026  
**Status:** implementado
**Contexto:** Auditoria da API REST existente em `packages/backend` para identificar problemas de segurança, status HTTP incorretos e inconsistências de código antes de iniciar a fase de refatoração.

## O que foi identificado

Utilizei o Claude Code para analisar o backend em `packages/backend`. O prompt solicitava uma análise sem alteração de arquivos, focando em segurança, status HTTP, organização e problemas de produção.

A análise retornou 16 problemas classificados em 5 categorias:

### Segurança (alta prioridade)
- **SEC-2** — Rota de login sem rate limiting, vulnerável a força bruta
- **SEC-1** — CORS completamente aberto (`cors()` sem opções)
- **SEC-4** — Senha sem tamanho máximo — vetor de DoS via bcrypt
- **SEC-3** — Ausência do helmet (headers HTTP de segurança)
- **SEC-5** — `dotenv.config()` não chamado no entry point `app.js`
- **SEC-6** — `JWT_SECRET` indefinido não gera erro claro no boot

### Status HTTP incorretos
- **HTTP-1** — `updateStatusTicket` retorna 500 quando ticket não existe (deveria ser 404)
- **HTTP-2** — Ticket não encontrado retorna 400 em vez de 404
- **HTTP-3** — UPDATE sem verificação de resultado retorna 200 sem corpo

### Bugs de autorização
- **AUTH-1** — Solicitante pode fechar ticket de **outro** solicitante (falta verificação de ownership)
- **AUTH-2** — `GET /tickets` retorna todos os tickets para qualquer perfil, incluindo Solicitante

### Qualidade e consistência
- **CODE-1** — Query inútil em `createNota` (resultado nunca verificado)
- **CODE-2** — Uso de `==` em vez de `===`
- **CODE-3** — `isNaN()` com comportamentos imprevisíveis para `''` e `null`
- **CODE-4** — Inconsistência no formato das respostas de erro
- **CODE-5** — Porta hardcoded como `3000` (quebra deploy em produção)
- **CODE-6** — Middleware de erro registrado antes das rotas

### Problemas de produção
- **PROD-1** — Sem paginação em listagens (degradação com volume)
- **PROD-2** — Sem graceful shutdown (conexões do banco cortadas abruptamente)
- **PROD-3** — Rota `/health` inline no `app.js`, quebrando o padrão MVC

## Decisão

Corrigir os problemas priorizando por impacto:

| Prioridade | IDs |
|---|---|
| 🔴 Alta | SEC-2, HTTP-1, AUTH-1 |
| 🟡 Média | SEC-1, SEC-4, AUTH-2, HTTP-2, HTTP-3, CODE-5 |
| 🟢 Baixa | SEC-3, CODE-1, CODE-2, CODE-3, PROD-2, PROD-3 |

> **PROD-1** (paginação) fora do escopo desta implementação — requer alterações no contrato de API e será tratado em ADR separado.

## Como foi feito

As correções foram aplicadas em três blocos, por ordem de prioridade definida acima.

| Arquivo | Correções aplicadas |
|---------|---------------------|
| `routes/usuarioRoutes.js` | SEC-2 |
| `routes/systemRoutes.js` | PROD-3 (arquivo novo) |
| `controllers/ticketController.js` | HTTP-1, AUTH-1, AUTH-2, HTTP-3, CODE-3 |
| `controllers/notaController.js` | HTTP-2, CODE-1, CODE-2, CODE-3 |
| `controllers/usuarioController.js` | SEC-4, CODE-3 |
| `controllers/systemController.js` | PROD-3 (arquivo novo) |
| `app.js` | SEC-1, CODE-5, SEC-3, PROD-2, PROD-3 |
| `config/db.js` | PROD-2 |

## O que aprendi

### 🔴 Alta prioridade

- **SEC-2 — Rate limiting:** proteger uma rota vai além da lógica do controller. O `express-rate-limit` age como camada anterior à rota — rejeita a requisição antes que ela chegue ao bcrypt ou ao banco. A configuração `max: 10, windowMs: 15 * 60 * 1000` é suficiente para inviabilizar força bruta sem impactar usuários legítimos.

- **HTTP-1 — Crash no updateStatusTicket:** o crash vinha de acessar `ticketAtual.analista_id` sem verificar se `ticketAtual` existia. JavaScript não falha ao declarar a variável como `undefined`, mas falha ao acessar uma propriedade dela. Uma linha `if (!ticketAtual) return res.status(404)` eliminou o 500 e retornou a resposta semanticamente correta.

- **AUTH-1 — Ownership no fechamento de ticket:** o bug era sutil — o código verificava corretamente que Solicitante só pode usar status "Fechado", mas nunca verificava *de quem* era o ticket. A correção foi acrescentar `ticketAtual.solicitante_id !== req.usuarioId` no mesmo bloco de autorização, reutilizando a consulta que já trazia `solicitante_id`.

### 🟡 Média prioridade

- **SEC-1 — CORS restrito:** `cors()` sem opções aceita qualquer origem. Passar `{ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }` separa os ambientes: em desenvolvimento usa o padrão local, em produção lê a variável de ambiente. Esse é o padrão de configuração de qualquer middleware que depende de contexto de deploy.

- **SEC-4 — Limite de senha:** bcrypt é intencionalmente lento por design de segurança. Quanto mais longa a senha, mais trabalho de CPU por requisição. Um atacante poderia enviar senhas de milhares de caracteres para sobrecarregar o servidor. O limite de 128 caracteres resolve isso sem nenhum impacto em senhas reais.

- **AUTH-2 — Escopo de tickets por perfil:** a query de listagem não tinha filtro por perfil. A solução usou um array de condições `conditions[]` e parâmetros `params[]`: se o usuário for Solicitante, `t.solicitante_id = $1` é adicionado como condição — caso contrário, a query segue sem filtro. Isso evita interpolação de strings na cláusula WHERE.

- **HTTP-2 — 404 para recurso não encontrado:** retornar `400` quando um recurso não é encontrado é semanticamente incorreto. `400` significa que a *requisição* está malformada; `404` significa que o *recurso* não existe. A semântica importa porque clientes e proxies se comportam de forma diferente dependendo do status.

- **HTTP-3 — Verificação do resultado do UPDATE:** o `UPDATE ... RETURNING *` pode retornar zero linhas em condição de corrida entre a verificação de existência e a atualização. Verificar `if (!result.rows[0])` antes de retornar `200` evita que o cliente receba uma resposta com corpo vazio acreditando que a operação teve sucesso.

- **CODE-5 — Porta via variável de ambiente:** `const PORT = 3000` hardcoded significa que em deploy não é possível escolher outra porta sem alterar o código. `process.env.PORT || 3000` usa o operador `||` para retornar o valor da direita quando o da esquerda é `undefined` — padrão universal em aplicações Node.js.

### 🟢 Baixa prioridade

- **SEC-3 — Helmet:** helmet injeta automaticamente headers que navegadores modernos respeitam para mitigar ataques como clickjacking e MIME sniffing. A diferença entre `cors` e `helmet` é o que cada um controla: cors controla *de onde* vem a requisição, helmet controla *como* o browser deve tratar a resposta.

- **CODE-1 — Query morta em createNota:** havia um `SELECT id FROM usuarios WHERE id = $1` que buscava o autor da nota sem jamais verificar o resultado. Código morto em caminho crítico gerava uma round-trip ao banco sem nenhum benefício. Remover foi a decisão correta — a identidade do autor já é garantida pelo JWT no middleware.

- **CODE-2 — `==` vs `===`:** o operador `==` faz coerção de tipo antes de comparar. Para strings, `===` é sempre o operador correto. A coerção do `==` pode produzir resultados inesperados e silenciosos em comparações como `'0' == false` (retorna `true`).

- **CODE-3 — `isNaN()` e suas armadilhas:** `isNaN('')` retorna `false` porque JavaScript converte string vazia para `0` antes de testar. O resultado é que um `ticket_id` vazio passaria pela validação. `Number.isInteger(Number(x)) && Number(x) > 0` é explícito: verifica se o valor é um número inteiro positivo, sem coerção silenciosa.

- **PROD-2 — Graceful shutdown:** sem esse tratamento, quando o processo é encerrado por um deploy ou Ctrl+C, conexões HTTP ativas são cortadas no meio da operação e o pool do PostgreSQL não é fechado corretamente. `server.close()` espera as requisições em andamento terminarem; só então `db.close()` encerra o pool e o processo sai com `exit(0)`.

- **PROD-3 — Extração da rota `/health`:** a rota estava escrita diretamente no `app.js` como função anônima, quebrando o padrão MVC adotado em todo o projeto. Mover para `systemController.js` e `systemRoutes.js` mantém a consistência arquitetural — qualquer rota nova de sistema vai para o mesmo lugar.

## Referências

- `packages/backend/src/app.js`
- `packages/backend/src/config/db.js`
- `packages/backend/src/controllers/ticketController.js`
- `packages/backend/src/controllers/notaController.js`
- `packages/backend/src/controllers/usuarioController.js`
- `packages/backend/src/controllers/systemController.js` (novo)
- `packages/backend/src/routes/usuarioRoutes.js`
- `packages/backend/src/routes/systemRoutes.js` (novo)
