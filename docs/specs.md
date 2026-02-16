# Especificação de Comportamento (BDD) - SS Tickets

## 1. Autenticação e Gestão de Usuários
**Objetivo:** Validar o controle de acesso (RBAC), persistência de sessão e integridade cadastral.

### Cenário: Cadastro de novo usuário com sucesso - (RF01, RNF03)
* **Dado** que o usuário está na tela de cadastro.
* **Quando** preenche todos os campos obrigatórios com dados válidos.
* **Então** o sistema deve realizar o hash da senha via `bcryptjs`.
* **E** retornar status `201 Created` ocultando a senha no JSON.

### Cenário: Impedir e-mail duplicado - (RN07, RNF04)
* **Dado** que um e-mail já existe na base de dados.
* **Quando** uma nova conta tenta utilizar o mesmo e-mail.
* **Então** o backend deve retornar erro `409 Conflict`.

### Cenário: Login e Redirecionamento por Perfil - (RF01, RF02)
* **Dado** que o usuário fornece credenciais válidas.
* **Quando** o login é processado.
* **Então** o sistema deve gerar um JWT com `id` e `perfil_id`.
* **E** o frontend deve redirecionar conforme o perfil: `1 (Solicitante)` para `/meus-chamados` ou `2 (Analista)` para `/fila-global`.

---

## 2. Operações de Tickets
**Objetivo:** Garantir a aplicação das travas de integridade e fluxo de atendimento.

### Cenário: Criação de Ticket e Validação de Título - (RF04, RN01)
* **Dado** que o usuário está autenticado.
* **Quando** tenta criar um ticket com título menor que 10 caracteres.
* **Então** o sistema deve bloquear a persistência e retornar status `400 Bad Request`.

### Cenário: Atribuição Automática de Solicitante - (RF04)
* **Dado** que um solicitante envia um ticket válido.
* **Quando** a requisição chega ao `ticketController`.
* **Então** o sistema deve extrair o `usuarioId` do JWT e salvá-lo como `solicitante_id`.

### Cenário: Alteração de Status e Restrição de Perfil - (RF05, RN02)
* **Dado** que um ticket está "Aguardando atendimento".
* **Quando** um Analista altera para "Em atendimento" via `PATCH /tickets/:ticketId`.
* **Então** o sistema deve validar se o status pertence à lista oficial e atualizar o banco.
* **E** impedir que um Solicitante realize a mesma transição para status técnicos.

---

## 3. Gestão de Notas e Histórico
**Objetivo:** Validar a ordem cronológica, visibilidade restrita e travas de fechamento.

### Cenário: Sequenciamento Isolado de Notas - (RF07, RN04)
* **Dado** que o Ticket A possui 2 notas e o Ticket B possui 0 notas.
* **Quando** uma nota é inserida no Ticket B.
* **Então** o `num_sequencial` da nova nota deve ser obrigatoriamente 1.

### Cenário: Sigilo de Notas Internas - (RF07, RN05)
* **Dado** que existe uma nota com `is_internal = TRUE` em um ticket.
* **Quando** um usuário com `perfil_id = 1` (Solicitante) consulta as notas.
* **Então** o sistema deve filtrar o resultado e não exibir o conteúdo desta nota.

### Cenário: Bloqueio de Notas em Tickets Finalizados - (RN06)
* **Dado** que o ticket possui status "Resolvido" ou "Fechado".
* **Quando** qualquer usuário tenta adicionar uma nota.
* **Então** o sistema deve retornar status `403 Forbidden` e desabilitar o input na UI.

---

## 4. Saúde do Sistema
**Objetivo:** Monitorar a integração entre as camadas de infraestrutura.

### Cenário: Monitoramento de Conectividade - (Health Check)
* **Quando** o frontend consome a rota `GET /health`.
* **Então** o backend deve responder com o horário do PostgreSQL, confirmando a conexão ativa.