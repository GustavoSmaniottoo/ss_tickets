# 004 — Refatoração do frontend React

**Data:** 05/06/2026  
**Status:** decidido  
**Contexto:** Com o backend auditado, corrigido e documentado, o próximo passo é refatorar o frontend existente para alinhá-lo com a nova base estruturada do projeto.

## O que motivou essa decisão

O frontend em `packages/frontend` foi desenvolvido durante a fase inicial do projeto, antes da documentação formal das regras de negócio e do contrato de API. Como consequência, algumas páginas estão incompletas, a integração com o backend é parcial e o código não reflete o comportamento esperado definido nos documentos que foram criados.

## A decisão

Refatorar o frontend React existente, mantendo a stack atual (React 19 + Vite), alinhando cada página e cada chamada de API com:

- O contrato de API documentado em `docs/contrato-api.md`
- As regras de negócio documentadas em `docs/regras-de-negocio.md`
- Os cenários BDD documentados em `docs/specs.md`

## O que será feito

### Autenticação
- Tela de cadastro de usuário
- Tela de login com redirecionamento por perfil — Solicitante vai para `/meus-chamados`, Analista vai para `/fila-global`
- Proteção de rotas — páginas privadas redirecionam para login se não houver token

### Visão do Solicitante
- Listagem dos próprios tickets com status e prioridade visíveis
- Ao clicar no ticket, expande mostrando o histórico de notas e campo para nova nota
- Abertura de novo ticket com título, descrição e prioridade
- Encerramento do ticket (alterar status para Fechado)

### Visão do Analista — Kanban
- Kanban com 7 colunas, uma por status do ciclo de vida do ticket
- Cards arrastáveis entre colunas (drag and drop)
- Cada card exibe: título, solicitante, prioridade e data de abertura
- Ao clicar no card abre o ticket completo com histórico de notas
- Filtro no kanban para exibir apenas tickets sem analista atribuído — utiliza o parâmetro `?sem_analista=true` já disponível no backend
- Referência de produto: Movidesk

### Ambos os perfis
- Bloqueio visual de ações quando o ticket está com status Resolvido ou Fechado
- Indicador visual de prioridade (P1, P2, P3)
- Tratamento de erros alinhado com o formato `{ "error": "..." }` do contrato de API

## Como será feito

O Claude Code será utilizado como ferramenta de refatoração. Cada mudança será revisada antes de ser aceita — o objetivo é entender o que foi feito e por que, não apenas aplicar as alterações.

## Como foi feito

### Dependência adicionada

| Pacote | Motivo |
|--------|--------|
| `@hello-pangea/dnd` | Drag and drop no Kanban. Fork mantido do `react-beautiful-dnd`, compatível com React 19 e StrictMode. Fornece `DragDropContext`, `Droppable` e `Draggable` como API declarativa, adequada para um Kanban de colunas fixas sem precisar de configuração de sensores manuais. |

### Arquivos criados

| Arquivo | O que faz |
|---------|-----------|
| `src/utils/auth.js` | Exporta `decodeToken` — extração do payload JWT sem dependência externa, antes duplicado inline em `Login.jsx`, agora compartilhado por todos os componentes que precisam ler `perfil` do token. |
| `src/components/PrioridadeBadge.jsx` | Badge visual com cor por prioridade (P1 vermelho, P2 amarelo, P3 verde), usado tanto em `MeusChamados` quanto nos cards do Kanban para cumprir o indicador visual exigido por `RN-VAL-02`. |
| `src/components/TicketDetalhe.jsx` | Painel de detalhe do ticket: busca notas via `GET /tickets/:id/notas`, filtra notas internas para Solicitante (preparando `RN-VIS-01` antes da implementação no backend), exibe campo de nova nota bloqueado para tickets finalizados (`RN-CICLO-01`), e oferece ações contextuais por perfil — "Fechar ticket" para Solicitante (`RN-ACESSO-04`) e "Assumir ticket" para Analista (`RN-ACESSO-03`). |
| `src/components/KanbanCard.jsx` | Card arrastável do Kanban usando `Draggable`: desabilita drag automaticamente para tickets com status `Resolvido` ou `Fechado` (`RN-CICLO-01`), exibe `PrioridadeBadge` e aplica opacidade reduzida com ícone de cadeado para indicar bloqueio visual. |
| `src/components/KanbanColuna.jsx` | Coluna do Kanban usando `Droppable`: recebe o nome do status como `droppableId` e renderiza a lista de `KanbanCard` correspondente. |

### Arquivos modificados

| Arquivo | O que mudou |
|---------|-------------|
| `src/App.jsx` | Importa `FilaGlobal` e substitui o `<div>` stub da rota `/fila-global` pelo componente real. |
| `src/pages/Login.jsx` | Remove a função `decodeToken` inline e a substitui pela importação de `src/utils/auth.js`. Comportamento idêntico, sem duplicação. |
| `src/pages/MeusChamados.jsx` | Adiciona expand/collapse por ticket com `TicketDetalhe` embutido, `PrioridadeBadge` em cada item da lista, indicador visual de bloqueio para tickets finalizados e callback `handleTicketAtualizado` para sincronizar o estado após fechar um ticket. |
| `src/pages/FilaGlobal.jsx` | Reescrito completamente: substitui a tabela estática pelo Kanban com 7 colunas (`DragDropContext` + `KanbanColuna`), drag and drop com atualização otimista e reversão em caso de erro, filtro toggle `sem_analista`, e painel lateral fixo com `TicketDetalhe` ao clicar em um card. |

## Referências

- `/docs/contrato-api.md`
- `/docs/regras-de-negocio.md`
- `/docs/specs.md`
- `/docs/decisions/003-auditoria-api-backend.md`
