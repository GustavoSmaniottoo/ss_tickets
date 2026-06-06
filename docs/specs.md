# Especificação de Comportamento (BDD) — SS Tickets

Cada cenário referencia a regra de negócio que valida, conforme definido em [`regras-de-negocio.md`](./regras-de-negocio.md).

As seções 1 a 6 cobrem comportamentos da API — todos testáveis via requisições diretas (`cy.request`).  
As seções 7 a 10 cobrem comportamentos da interface — testáveis via Cypress E2E com interação de UI (`cy.visit`, `cy.get`, `cy.drag`).

---

## 1. Identidade e Autenticação

**Objetivo:** Validar o cadastro, a autenticação e que a identidade usada nas operações vem da sessão — nunca do body da requisição.

---

### Cenário: Cadastro de novo usuário com sucesso — (RN-ID-02)

* **Dado** que `POST /usuarios` recebe nome, e-mail, senha válida e perfil_id existente
* **Quando** a requisição é processada
* **Então** o sistema deve retornar status `201 Created`
* **E** o body da resposta não deve conter o campo `senha`

---

### Cenário: E-mail duplicado impede novo cadastro — (RN-ID-01)

* **Dado** que um e-mail já existe na base de dados
* **Quando** uma nova conta tenta utilizar o mesmo e-mail via `POST /usuarios`
* **Então** o backend deve retornar status `409 Conflict`

---

### Cenário: Login com credenciais válidas retorna token

* **Dado** que o usuário fornece e-mail e senha corretos
* **Quando** `POST /usuarios/login` é chamado
* **Então** o sistema deve retornar status `200 OK`
* **E** o body deve conter um token JWT

---

### Cenário: Login com credenciais inválidas é bloqueado

* **Dado** que o usuário fornece senha incorreta para um e-mail existente
* **Quando** `POST /usuarios/login` é chamado
* **Então** o sistema deve retornar status `401 Unauthorized`
* **E** a mensagem de erro não deve indicar qual campo está incorreto

---

### Cenário: Solicitante_id do ticket é extraído do token — (RN-ID-03)

* **Dado** que um Solicitante está autenticado
* **Quando** cria um ticket com dados válidos via `POST /tickets`
* **Então** o `solicitante_id` do ticket criado deve corresponder ao id do usuário autenticado

---

### Cenário: Autor_id da nota é extraído do token — (RN-ID-03)

* **Dado** que um usuário está autenticado
* **Quando** cria uma nota com dados válidos via `POST /notas`
* **Então** o `autor_id` da nota criada deve corresponder ao id do usuário autenticado

---

## 2. Controle de Acesso por Perfil

**Objetivo:** Garantir que as restrições de perfil são aplicadas no servidor, independentemente do que o cliente envia.

---

### Cenário: Solicitante não pode listar todos os usuários — (RN-ACESSO-01)

* **Dado** que o usuário autenticado tem perfil Solicitante (perfil_id = 1)
* **Quando** realiza `GET /usuarios`
* **Então** o sistema deve retornar status `403 Forbidden`

---

### Cenário: Solicitante não pode consultar dados de outro usuário — (RN-ACESSO-01)

* **Dado** que o Solicitante A está autenticado
* **E** existe um usuário B com id diferente
* **Quando** Solicitante A realiza `GET /usuarios/:id` com o id de B
* **Então** o sistema deve retornar status `403 Forbidden`

---

### Cenário: Solicitante vê apenas os próprios tickets — (RN-ACESSO-02)

* **Dado** que existem tickets de múltiplos solicitantes na base
* **Quando** um Solicitante autenticado realiza `GET /tickets`
* **Então** a lista retornada deve conter apenas os tickets cujo `solicitante_id` corresponde ao id do usuário autenticado

---

### Cenário: Solicitante não pode assumir ticket — (RN-ACESSO-03)

* **Dado** que o usuário autenticado tem perfil Solicitante
* **Quando** envia `PATCH /tickets/:ticketId` com `{ "acao": "assumir" }`
* **Então** o sistema deve retornar status `403 Forbidden`

---

### Cenário: Analista pode assumir ticket — (RN-ACESSO-03)

* **Dado** que existe um ticket sem analista atribuído
* **E** o usuário autenticado tem perfil Analista
* **Quando** envia `PATCH /tickets/:ticketId` com `{ "acao": "assumir" }`
* **Então** o sistema deve retornar status `200 OK`
* **E** o `analista_id` do ticket deve ser o id do Analista autenticado

---

### Cenário: Solicitante não pode alterar status para fases técnicas — (RN-ACESSO-04)

* **Dado** que o usuário autenticado tem perfil Solicitante
* **Quando** tenta alterar o status de um ticket para "Em atendimento" via `PATCH /tickets/:ticketId`
* **Então** o sistema deve retornar status `403 Forbidden`

---

### Cenário: Solicitante pode fechar o próprio ticket — (RN-ACESSO-04)

* **Dado** que o usuário autenticado tem perfil Solicitante
* **E** o ticket pertence ao próprio Solicitante
* **E** o ticket não está com status "Resolvido" nem "Fechado"
* **Quando** envia `PATCH /tickets/:ticketId` com `{ "status": "Fechado" }`
* **Então** o sistema deve retornar status `200 OK`
* **E** o status do ticket deve ser "Fechado"

---

### Cenário: Solicitante não pode adicionar nota a ticket alheio — (RN-ACESSO-05)

* **Dado** que existe um ticket criado por um Solicitante B
* **Quando** um Solicitante A diferente tenta adicionar uma nota a esse ticket via `POST /notas`
* **Então** o sistema deve retornar status `403 Forbidden`

---

## 3. Validação de Dados

**Objetivo:** Garantir que dados inválidos são rejeitados antes de atingir o banco de dados.

---

### Cenário: Título de ticket com menos de 10 caracteres é rejeitado — (RN-VAL-01)

* **Dado** que o usuário está autenticado
* **Quando** tenta criar um ticket com título de 9 caracteres ou menos via `POST /tickets`
* **Então** o sistema deve retornar status `400 Bad Request`

---

### Cenário: Prioridade fora do domínio é rejeitada — (RN-VAL-02)

* **Dado** que o usuário está autenticado
* **Quando** tenta criar um ticket com prioridade inválida (ex: "P4") via `POST /tickets`
* **Então** o sistema deve retornar status `400 Bad Request`

---

### Cenário: Conteúdo de nota vazio ou em branco é rejeitado — (RN-VAL-03)

* **Dado** que o usuário está autenticado
* **Quando** tenta criar uma nota com conteúdo vazio ou composto apenas de espaços via `POST /notas`
* **Então** o sistema deve retornar status `400 Bad Request`

---

### Cenário: Nota com mais de 5000 caracteres é rejeitada — (RN-VAL-03)

* **Dado** que o usuário está autenticado
* **Quando** tenta criar uma nota com conteúdo de 5001 caracteres ou mais via `POST /notas`
* **Então** o sistema deve retornar status `400 Bad Request`

---

### Cenário: Cadastro com senha de menos de 6 caracteres é rejeitado — (RN-VAL-04)

* **Dado** que um usuário tenta criar uma conta via `POST /usuarios`
* **Quando** a senha informada tem menos de 6 caracteres
* **Então** o sistema deve retornar status `400 Bad Request`

---

### Cenário: Cadastro com e-mail em formato inválido é rejeitado — (RN-VAL-05)

* **Dado** que um usuário tenta criar uma conta via `POST /usuarios`
* **Quando** o e-mail informado não está no formato `usuario@dominio.ext`
* **Então** o sistema deve retornar status `400 Bad Request`

---

## 4. Ciclo de Vida do Ticket

**Objetivo:** Garantir as travas de status e a integridade do fluxo de atendimento.

---

### Cenário: Nota bloqueada em ticket com status "Resolvido" — (RN-CICLO-01)

* **Dado** que existe um ticket com status "Resolvido"
* **Quando** qualquer usuário tenta adicionar uma nota via `POST /notas`
* **Então** o sistema deve retornar status `403 Forbidden`

---

### Cenário: Nota bloqueada em ticket com status "Fechado" — (RN-CICLO-01)

* **Dado** que existe um ticket com status "Fechado"
* **Quando** qualquer usuário tenta adicionar uma nota via `POST /notas`
* **Então** o sistema deve retornar status `403 Forbidden`

---

### Cenário: Assumir ticket sem analista define status "Em atendimento" automaticamente — (RN-CICLO-02)

* **Dado** que existe um ticket com status "Aguardando atendimento" e sem analista atribuído
* **Quando** um Analista envia `PATCH /tickets/:ticketId` com `{ "acao": "assumir" }`
* **Então** o status do ticket deve ser "Em atendimento"

---

### Cenário: Assumir ticket com analista mantém o status atual — (RN-CICLO-02)

* **Dado** que existe um ticket com status "Aguardando cliente" que já possui analista atribuído
* **Quando** um segundo Analista envia `PATCH /tickets/:ticketId` com `{ "acao": "assumir" }`
* **Então** o status do ticket deve permanecer "Aguardando cliente"
* **E** o `analista_id` deve ser atualizado para o do novo Analista

---

### Cenário: Sequenciamento isolado de notas por ticket — (RN-CICLO-03)

* **Dado** que o Ticket A possui 2 notas e o Ticket B possui 0 notas
* **Quando** uma nota é inserida no Ticket B
* **Então** o `num_sequencial` da nova nota deve ser `1`

---

## 5. Visibilidade de Notas

---

### Cenário: Solicitante não recebe notas internas — (RN-VIS-01)

> ⚠️ **Não implementado:** O filtro por `is_internal` ainda não existe em `notaController.getNotasByTicket`. Automatizar este cenário após a implementação no backend.

* **Dado** que existe uma nota com `is_internal = true` vinculada a um ticket
* **Quando** um usuário com perfil Solicitante consulta as notas via `GET /tickets/:ticket_id/notas`
* **Então** a resposta não deve conter a nota marcada como interna

---

## 6. Saúde do Sistema

---

### Cenário: Health check confirma conectividade com o banco de dados

* **Quando** `GET /health` é chamado
* **Então** o sistema deve retornar status `200 OK`
* **E** o body deve conter o campo `db_time` com o timestamp atual do PostgreSQL

---

## 7. Redirecionamento por Perfil (Frontend)

**Objetivo:** Garantir que após o login o usuário é direcionado para a tela correta de acordo com seu perfil — sem que o cliente precise conhecer a lógica de roteamento antecipadamente.

---

### Cenário: Login de Solicitante redireciona para Meus Chamados — (RN-ACESSO-02)

* **Dado** que um usuário com perfil Solicitante está na tela de login
* **Quando** informa credenciais válidas e submete o formulário
* **Então** a URL do navegador deve mudar para `/meus-chamados`
* **E** a rota `/login` não deve aparecer no histórico de navegação (navegação com `replace`)

---

### Cenário: Login de Analista redireciona para Fila Global — (RN-ACESSO-02)

* **Dado** que um usuário com perfil Analista está na tela de login
* **Quando** informa credenciais válidas e submete o formulário
* **Então** a URL do navegador deve mudar para `/fila-global`
* **E** a rota `/login` não deve aparecer no histórico de navegação (navegação com `replace`)

---

### Cenário: Rota privada redireciona para login quando não há token — (RN-ID-03)

* **Dado** que nenhum token está armazenado no `localStorage`
* **Quando** o usuário tenta acessar diretamente `/meus-chamados` ou `/fila-global`
* **Então** o sistema deve redirecionar para `/login`

---

## 8. Visão do Solicitante (Frontend)

**Objetivo:** Garantir que o Solicitante consegue abrir chamados, acompanhar o histórico de notas e encerrar tickets diretamente pela interface.

---

### Cenário: Solicitante visualiza lista de tickets com status e prioridade — (RN-ACESSO-02)

* **Dado** que um Solicitante autenticado possui tickets cadastrados
* **Quando** acessa a tela `/meus-chamados`
* **Então** a lista deve exibir cada ticket com seu status e prioridade visíveis
* **E** a lista não deve conter tickets de outros solicitantes

---

### Cenário: Solicitante expande ticket para ver histórico de notas — (RN-VIS-01)

* **Dado** que um Solicitante está na tela `/meus-chamados`
* **E** existe um ticket com pelo menos uma nota pública associada
* **Quando** clica no ticket para expandi-lo
* **Então** o histórico de notas deve ser exibido ordenado por `num_sequencial` crescente
* **E** notas marcadas como internas (`is_internal = true`) não devem aparecer

---

### Cenário: Solicitante adiciona nota em ticket expandido — (RN-ACESSO-05, RN-VAL-03)

* **Dado** que um Solicitante está com um ticket expandido na tela `/meus-chamados`
* **E** o ticket está com status diferente de "Resolvido" e "Fechado"
* **Quando** preenche o campo de nota com conteúdo válido e confirma o envio
* **Então** a nova nota deve aparecer no histórico com o número sequencial correto
* **E** o campo de nota deve ser limpo após o envio

---

### Cenário: Campo de nova nota desabilitado para ticket finalizado — (RN-CICLO-01)

* **Dado** que um Solicitante está com um ticket expandido
* **E** o ticket está com status "Resolvido" ou "Fechado"
* **Quando** visualiza a área de notas
* **Então** o campo para adicionar nota deve estar desabilitado ou oculto
* **E** uma mensagem deve indicar que o ticket não aceita mais interações

---

### Cenário: Formulário bloqueia envio com título menor que 10 caracteres — (RN-VAL-01)

* **Dado** que um Solicitante está no formulário de abertura de ticket em `/meus-chamados`
* **Quando** informa um título com menos de 10 caracteres e tenta submeter
* **Então** o sistema deve exibir uma mensagem de erro indicando o mínimo exigido
* **E** nenhuma requisição deve ser enviada ao backend

---

### Cenário: Solicitante abre novo ticket com dados válidos — (RN-VAL-01, RN-VAL-02)

* **Dado** que um Solicitante está na tela `/meus-chamados`
* **Quando** preenche o formulário com título de pelo menos 10 caracteres, descrição e prioridade válida
* **E** submete o formulário
* **Então** o novo ticket deve aparecer na lista imediatamente após o retorno do backend
* **E** o formulário deve ser limpo após o envio com sucesso

---

### Cenário: Solicitante encerra o próprio ticket — (RN-ACESSO-04)

* **Dado** que um Solicitante está na tela `/meus-chamados`
* **E** existe um ticket com status diferente de "Resolvido" e "Fechado"
* **Quando** aciona a opção de encerrar o ticket
* **Então** o sistema deve enviar `PATCH /tickets/:id` com `{ "status": "Fechado" }`
* **E** o status exibido na lista deve ser atualizado para "Fechado"
* **E** a ação de encerrar deve ficar desabilitada para esse ticket

---

### Cenário: Botão de encerrar ticket desabilitado para tickets finalizados — (RN-CICLO-01)

* **Dado** que um Solicitante está na tela `/meus-chamados`
* **E** existe um ticket com status "Resolvido" ou "Fechado"
* **Quando** visualiza esse ticket na lista
* **Então** a opção de encerrar o ticket deve estar desabilitada ou oculta

---

## 9. Visão do Analista — Kanban (Frontend)

**Objetivo:** Garantir que o Analista consegue visualizar todos os tickets organizados por status, mover tickets entre colunas, filtrar a fila e acessar o detalhe de cada chamado.

---

### Cenário: Kanban exibe 7 colunas correspondentes ao ciclo de vida do ticket

* **Dado** que um Analista está autenticado
* **Quando** acessa a tela `/fila-global`
* **Então** o Kanban deve exibir exatamente 7 colunas, uma para cada status:  
  `Aguardando atendimento`, `Em atendimento`, `Aguardando cliente`, `Respondido`, `Tratativa Interna`, `Resolvido`, `Fechado`
* **E** cada ticket deve aparecer na coluna correspondente ao seu status atual

---

### Cenário: Cards do Kanban exibem as informações essenciais do ticket

* **Dado** que existem tickets distribuídos nas colunas do Kanban
* **Quando** o Analista visualiza um card
* **Então** o card deve exibir: título, nome do solicitante, prioridade e data de abertura

---

### Cenário: Analista move card entre colunas via drag and drop — (RN-ACESSO-04)

* **Dado** que um Analista está no Kanban
* **E** existe um ticket com status "Em atendimento"
* **Quando** arrasta o card para a coluna "Aguardando cliente"
* **Então** o sistema deve enviar `PATCH /tickets/:id` com `{ "status": "Aguardando cliente" }`
* **E** o card deve aparecer na coluna de destino após a confirmação do backend
* **E** o card deve retornar à coluna de origem caso o backend retorne erro

---

### Cenário: Drag and drop não é permitido para colunas Resolvido e Fechado — (RN-CICLO-01)

* **Dado** que um Analista está no Kanban
* **E** existe um ticket com status "Resolvido" ou "Fechado"
* **Quando** tenta arrastar o card para outra coluna
* **Então** o movimento deve ser bloqueado visualmente pela interface
* **E** nenhuma requisição deve ser enviada ao backend

---

### Cenário: Analista filtra Kanban para exibir apenas tickets sem analista — (RN-ACESSO-03)

* **Dado** que um Analista está no Kanban com tickets distribuídos nas colunas
* **Quando** ativa o filtro "Sem analista atribuído"
* **Então** o Kanban deve exibir apenas tickets onde `analista_id` é nulo
* **E** a requisição `GET /tickets` deve incluir o parâmetro `?sem_analista=true`

---

### Cenário: Analista abre ticket completo a partir de um card — (RN-VIS-01)

* **Dado** que um Analista está no Kanban
* **Quando** clica em um card de ticket
* **Então** o detalhe do ticket deve ser exibido (painel lateral ou modal)
* **E** o histórico completo de notas — incluindo notas internas — deve ser exibido
* **E** um campo para adicionar nova nota deve estar disponível se o ticket não estiver finalizado

---

### Cenário: Analista assume ticket a partir do detalhe — (RN-ACESSO-03, RN-CICLO-02)

* **Dado** que um Analista está visualizando o detalhe de um ticket sem analista atribuído
* **Quando** aciona a opção "Assumir ticket"
* **Então** o sistema deve enviar `PATCH /tickets/:id` com `{ "acao": "assumir" }`
* **E** o campo de analista responsável deve exibir o nome do Analista autenticado
* **E** se o ticket estava em "Aguardando atendimento", o status deve mudar para "Em atendimento"

---

## 10. Indicadores Visuais (Frontend)

**Objetivo:** Garantir que a interface comunica visualmente prioridade e estado de bloqueio dos tickets, sem depender apenas de texto.

---

### Cenário: Indicador visual diferencia prioridades P1, P2 e P3 — (RN-VAL-02)

* **Dado** que existem tickets com prioridades diferentes listados na interface
* **Quando** o usuário visualiza a lista em `/meus-chamados` ou o Kanban em `/fila-global`
* **Então** cada ticket deve exibir um indicador visual distinto por prioridade:  
  `P1` (crítica), `P2` (média), `P3` (baixa)

---

### Cenário: Ticket finalizado exibe indicador visual de bloqueio — (RN-CICLO-01)

* **Dado** que existem tickets com status "Resolvido" ou "Fechado" na interface
* **Quando** o usuário visualiza esses tickets
* **Então** eles devem exibir um indicador visual diferenciado (ex: opacidade reduzida, ícone de cadeado ou badge de status)  
* **E** todas as ações interativas devem estar desabilitadas ou ocultas

---

## 11. Filtro por Analista no Kanban (Frontend)

**Objetivo:** Garantir que o Kanban exibe apenas os tickets relevantes para o contexto de trabalho do Analista, com pré-seleç��o inteligente ao entrar na tela e suporte a múltiplas seleções simultâneas.

---

### Cenário: Kanban carregado com o analista logado pré-selecionado — (RN-ACESSO-02)

* **Dado** que um Analista acaba de fazer login
* **Quando** acessa a tela `/fila-global`
* **Então** a barra de filtro deve exibir o nome do Analista logado como selecionado
* **E** a opção "Não atribuído" também deve estar selecionada por padrão
* **E** o Kanban deve exibir apenas os tickets atribuídos ao Analista logado e os tickets sem analista

---

### Cenário: Kanban sem nenhum analista selecionado não exibe tickets

* **Dado** que um Analista está na tela `/fila-global`
* **Quando** remove todas as seleções da barra de filtro
* **Então** o Kanban deve exibir zero cards em todas as colunas
* **E** uma mensagem informativa deve indicar que nenhum filtro está ativo

---

### Cenário: Múltiplos analistas podem ser selecionados simultaneamente — (RN-ACESSO-02)

* **Dado** que existem tickets de diferentes analistas na base
* **E** o Analista está na tela `/fila-global`
* **Quando** seleciona dois ou mais nomes na barra de filtro
* **Então** o Kanban deve exibir os tickets de todos os analistas selecionados
* **E** desselecionar um analista não deve afetar a seleção dos demais

---

### Cenário: "Não atribuído" sempre aparece por último na barra de filtro

* **Dado** que existem múltiplos analistas cadastrados no sistema
* **Quando** o Analista visualiza a barra de filtro na tela `/fila-global`
* **Então** a opção "Não atribuído" deve aparecer após todos os nomes de analistas
* **E** os nomes de analistas devem aparecer em ordem alfabética

---

## 12. Modal Fullscreen de Ticket (Frontend)

**Objetivo:** Garantir que ao clicar em um ticket — tanto no Kanban quanto na lista do Solicitante — o usuário acessa todas as informações em um modal fullscreen com histórico de notas e campo de interação.

---

### Cenário: Clicar em card do Kanban abre modal fullscreen com informações completas — (RN-ACESSO-02)

* **Dado** que um Analista está no Kanban
* **Quando** clica em um card de ticket
* **Então** um modal deve ocupar a tela inteira (fullscreen)
* **E** o modal deve exibir: título, status atual, prioridade, nome do solicitante e nome do analista responsável
* **E** o histórico completo de notas — incluindo notas internas — deve estar visível em ordem cronológica

---

### Cenário: Fechar modal retorna o Analista ao Kanban na mesma posição de scroll

* **Dado** que um Analista está no Kanban com as colunas visíveis em determinada posição de scroll
* **Quando** abre o modal de um ticket e depois o fecha
* **Então** o Kanban deve estar visível na mesma posição de scroll horizontal onde estava antes da abertura

---

### Cenário: Campo de nota bloqueado no modal para ticket finalizado — (RN-CICLO-01)

* **Dado** que um usuário abre o modal de um ticket com status "Resolvido" ou "Fechado"
* **Quando** visualiza a seção de notas no modal
* **Então** o campo de texto para nova nota deve estar ausente ou desabilitado
* **E** uma mensagem deve indicar que o ticket está encerrado e não aceita mais interações

---

### Cenário: Solicitante clica em ticket da lista e abre modal fullscreen — (RN-ACESSO-02)

* **Dado** que um Solicitante está na tela `/meus-chamados` com a lista de tickets visível
* **Quando** clica em um ticket da lista
* **Então** um modal fullscreen deve ser exibido com título, status, prioridade e histórico de notas
* **E** o campo para nova nota deve estar disponível se o ticket não estiver finalizado
* **E** notas marcadas como internas não devem aparecer para o Solicitante — (RN-VIS-01)

---

### Cenário: Solicitante vê lista de tickets como view principal ao entrar na tela — (RN-ACESSO-02)

* **Dado** que um Solicitante faz login e é redirecionado para `/meus-chamados`
* **Quando** a tela carrega
* **Então** a lista dos próprios tickets deve ser exibida imediatamente
* **E** um botão destacado "Abrir novo chamado" deve estar visível acima da lista
* **E** o formulário de criação de ticket não deve estar visível por padrão

---

### Cenário: Clicar em "Abrir novo chamado" exibe o formulário de criação — (RN-VAL-01, RN-VAL-02)

* **Dado** que um Solicitante está na tela `/meus-chamados`
* **Quando** clica no botão "Abrir novo chamado"
* **Então** o formulário de criação de ticket deve se tornar visível
* **E** os campos de título, descrição e prioridade devem estar disponíveis e focáveis
