# 006 — Melhorias de UX no frontend

**Data:** 05/06/2026  
**Status:** implementado  
**Contexto:** Após os primeiros testes do frontend refatorado (ADR 004), foram identificadas melhorias de experiência de uso que tornam o sistema mais próximo do padrão de ferramentas de suporte do mercado.

## O que motivou essa decisão

Os testes iniciais revelaram que o kanban sem filtro ficava sobrecarregado visualmente, que a abertura de tickets precisava de mais contexto e que a visão do Solicitante não seguia o fluxo natural de uso — lista primeiro, ação depois.

## Decisão

### Kanban do Analista — filtro por analista

Adicionar uma barra de filtro no topo do kanban com os nomes dos analistas disponíveis, seguindo o padrão do Jira Service Manager:

- Ao entrar na tela, o filtro já vem pré-selecionado com o analista logado e o "Não atribuído"
- Se nenhum analista estiver selecionado, o kanban não exibe nenhum ticket
- É possível selecionar múltiplos analistas simultaneamente
- "Não atribuído" sempre aparece por último na barra de filtro

### Kanban do Analista — abertura de ticket

Ao clicar em um card do kanban, abre um modal fullscreen com todas as informações do ticket:

- Título, status, prioridade, solicitante e analista responsável
- Histórico de notas em ordem cronológica
- Campo para adicionar nova nota (bloqueado se o ticket estiver Resolvido ou Fechado)
- Fechar o modal retorna o analista ao kanban exatamente onde estava

### Visão do Solicitante

- Ao entrar, o Solicitante vê diretamente a lista dos próprios tickets
- Um botão destacado "Abrir novo chamado" permite criar um novo ticket
- Ao clicar em um ticket da lista, abre o mesmo modal fullscreen do Analista com as informações do ticket, histórico de notas e campo para nova nota

## Estilização

Nesta etapa o foco é funcionalidade — a interface deve ser limpa, legível e consistente, sem preocupação com identidade visual. Decisões de estilo como paleta de cores, tipografia e responsividade serão tratadas em um ADR futuro.

## O que não muda

- A lógica de bloqueio visual em tickets Resolvido ou Fechado (já implementada no ADR 004)
- O drag and drop entre colunas do kanban (já implementado no ADR 004)
- O filtro de tickets sem analista via `?sem_analista=true` (já implementado no ADR 004)

## Como foi feito

### Arquivos criados

| Arquivo | O que faz |
|---------|-----------|
| `src/components/ModalTicket.jsx` | Modal fullscreen que envolve `TicketDetalhe`. Renderizado com `position: fixed` cobrindo 100% da tela sobre o Kanban, que permanece montado e preserva o scroll. Fecha com o botão ✕ ou tecla ESC. Usado por `FilaGlobal` e `MeusChamados`. |
| `src/components/FiltroAnalistas.jsx` | Barra de chips de analistas. Busca `GET /usuarios`, filtra por `perfil_id = 2`, renderiza um chip por analista com "Não atribuído" sempre por último. Recebe `selecionados` e `onChange` — a lógica de filtragem fica no pai (`FilaGlobal`). |

### Arquivos modificados

| Arquivo | O que mudou |
|---------|-------------|
| `src/pages/FilaGlobal.jsx` | Adiciona `FiltroAnalistas` no topo com pré-seleção do analista logado + "Não atribuído" na montagem. Filtragem dos tickets é client-side sobre os dados já carregados. Seleção vazia exibe kanban vazio com mensagem informativa. Substitui painel lateral fixo por `ModalTicket`. |
| `src/pages/MeusChamados.jsx` | Formulário de criação oculto por padrão — botão "Abrir novo chamado" faz toggle. Substitui expand inline por `ModalTicket` ao clicar em qualquer ticket da lista. |

## Referências

- `docs/decisions/004-refatoracao-frontend-react.md`
- `docs/decisions/005-bloqueio-tickets-finalizados-backend.md`
- `docs/regras-de-negocio.md` — RN-ACESSO-02, RN-CICLO-01
- `docs/contrato-api.md` — `GET /tickets`, `GET /tickets/:ticketId/notas`
