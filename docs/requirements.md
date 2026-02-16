# Especificação de Requisitos: SS Tickets

Este documento estabelece as diretrizes técnicas e regras de negócio para o MVP do sistema SS Tickets, servindo como base para o desenvolvimento e para a suíte de testes E2E.

---

## 1. Requisitos Funcionais (RF)

### Autenticação e Segurança
* **RF01 - Autenticação Stateless:** O sistema deve autenticar usuários utilizando o padrão **JWT (JSON Web Token)**, garantindo sessões seguras e escaláveis.
* **RF02 - Controle de Acesso (RBAC):** As interfaces e permissões de API devem ser segregadas por perfis: **Solicitante** (id: 1), **Analista** (id: 2) e **Admin** (id: 3).
* **RF03 - Proteção de Rotas:** Todos os endpoints críticos (tickets e notas) devem validar o token no cabeçalho `Authorization` via `authMiddleware`.

### Gestão de Chamados e Interações
* **RF04 - Abertura de Ticket:** O sistema deve permitir a criação de chamados capturando Título, Descrição e Prioridade (P1, P2 ou P3).
* **RF05 - Gestão de Ciclo de Vida:** O sistema deve suportar os status: *'Aguardando atendimento', 'Em atendimento', 'Aguardando cliente', 'Respondido', 'Tratativa Interna', 'Resolvido'* e *'Fechado'*.
* **RF06 - Registro de Notas:** O sistema deve permitir o registro de notas vinculadas a um ticket, identificando o autor e a data de criação.
* **RF07 - Auditoria de Notas Internas:** Suporte a notas técnicas (internas) que possuem visibilidade restrita conforme o perfil do usuário.

---

## 2. Requisitos Não-Funcionais (RNF)

* **RNF01 - Testabilidade (QA-First):** Elementos de interface críticos para a automação devem obrigatoriamente possuir o atributo `data-cy`.
* **RNF02 - Integridade Referencial:** O banco de dados PostgreSQL deve garantir a consistência dos dados através de chaves estrangeiras (`FOREIGN KEY`) entre usuários, perfis e tickets.
* **RNF03 - Criptografia:** Senhas de usuários não devem ser armazenadas em texto plano, utilizando obrigatoriamente `bcryptjs` para geração de hashes.
* **RNF04 - Padronização de API:** O backend deve seguir os princípios REST, utilizando métodos HTTP semânticos (GET, POST, PATCH) e códigos de status apropriados.

---

## 3. Regras de Negócio (RN)

* **RN01 - Validação de Título:** O título do ticket é obrigatório e deve possuir no mínimo **10 caracteres**.
* **RN02 - Restrição de Status por Perfil:** O perfil **Solicitante** está impedido de alterar o status do ticket para fases de controle técnico ou encerramento manual (ex: "Tratativa Interna").
* **RN03 - Domínio de Prioridades:** O sistema deve rejeitar qualquer valor de prioridade que não seja **P1 (Crítica)**, **P2 (Média)** ou **P3 (Baixa)**.
* **RN04 - Isolamento de Sequenciamento:** O contador de notas (`num_sequencial`) deve ser calculado individualmente por ticket através da lógica $Max + 1$.
* **RN05 - Sigilo de Notas Internas:** Notas marcadas como `is_internal = TRUE` não devem ser retornadas em requisições realizadas por usuários com perfil **Solicitante**.
* **RN06 - Travamento de Edição em Tickets Finalizados:** É proibida a adição de novas notas ou alteração de dados em tickets que possuam status **'Resolvido'** ou **'Fechado'**.
* **RN07 - Unicidade de Identidade:** O e-mail de usuário deve ser único em toda a base de dados (Constraint `UNIQUE`).

Voltar para o [README](/docs/README.md)
