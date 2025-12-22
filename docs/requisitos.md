# Especificação de Requisitos: SS Tickets (Pilot)

**Projeto:** SS Tickets (Smaniotto Solutions)  
**Objetivo:** Sistema de gestão de chamados internos focado em rastreabilidade e testabilidade.

---

## 1. Requisitos Funcionais (RF)

### Autenticação e Perfis
* **RF01 - Login de Usuário:** Autenticação via e-mail e senha validados no PostgreSQL.
* **RF02 - Controle de Acesso (RBAC):** Interfaces distintas para **Solicitante**, **Analista** e **Admin**.
* **RF03 - Logout:** Encerramento seguro da sessão pelo usuário.

### Gestão de Chamados e Notas
* **RF04 - Abertura de Ticket:** Criação de chamados com Título, Descrição e Prioridade (P1, P2 ou P3).
* **RF05 - Gestão de Status:** O **Analista** gerencia o fluxo: *Aguardando atendimento -> Em atendimento -> Aguardando cliente -> Respondido -> Tratativa Interna -> Resolvido*.
* **RF06 - Registro de Notas:** O sistema deve permitir dois tipos de notas: Públicas (visíveis para todos) e Internas (visíveis apenas para Analistas e Admins).
* **RF07 - Contador de Notas:** Cada nota inserida deve receber um número sequencial automático (Ex: Nota #1, Nota #2) para facilitar menções e rastreabilidade técnica.

---

## 2. Requisitos Não-Funcionais (RNF)

* **RNF01 - Testabilidade (SDET Focus):** Elementos críticos devem possuir o atributo `data-test` para automação com Cypress.
* **RNF02 - Persistência de Dados:** Uso de banco de dados PostgreSQL.
* **RNF03 - Arquitetura de API:** Backend RESTful utilizando métodos HTTP (GET, POST, PATCH).
* **RNF04 - Escalabilidade de Mídia:** Modelagem preparada para futuros anexos e notas ricas.
* **RNF05 - Segurança:** Senhas criptografadas no banco de dados.

---

## 3. Regras de Negócio (RN)

* **RN01 - Integridade do Título:** Mínimo de 10 caracteres para abertura do ticket.
* **RN02 - Hierarquia de Status:** O Solicitante não pode alterar status para fases técnicas (Ex: Em atendimento/Tratativa Interna).
* **RN03 - Unificação de Prioridade:** Campo único seguindo a escala: P1 (Crítico), P2 (Médio) e P3 (Baixo).
* **RN04 - Sequenciamento de Notas:** O contador de notas é individual por ticket e reinicia em cada novo chamado.
* **RN05 - Visibilidade da Nota Interna:** Solicitantes jamais devem acessar o conteúdo ou a existência de Notas Internas (Tela ou API).
* **RN06 - Destaque de Notas:** Notas internas devem ter marcação visual clara para o Analista.
* **RN07 - Unicidade do Contador:** O contador é absoluto e cronológico; notas internas consomem um número na sequência para auditoria.

[Voltar para README](/docs/README.md)