# Caderno de Casos de Teste - SS Tickets (Smaniotto Solutions)

Este documento detalha os cenários e casos de teste para o MVP do sistema de gerenciamento de chamados internos.

---

## Cenário 01: Autenticação e Controle de Acesso (RBAC)

>Role-Based Access Control (Controle de Acesso Baseado em Papéis)

**Objetivo:** Validar se o sistema identifica corretamente os perfis e restringe acessos indevidos.

| ID | Caso de Teste | Requisito | Ações / Passos | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **CT-01.1** | Login com perfil Analista | RF-01, RF-02 | Inserir e-mail de Analista e senha válida na tela de login. | Redirecionar para a Fila Global de Atendimento. |
| **CT-01.2** | Login com perfil Solicitante | RF-01, RF-02 | Inserir e-mail de Solicitante e senha válida na tela de login. | Redirecionar para a tela "Meus Chamados". |
| **CT-01.3** | Falha de autenticação | RF-01 | Inserir um e-mail cadastrado mas com a senha incorreta. | Exibir a mensagem de erro: "E-mail ou senha inválidos". |
| **CT-01.4** | Bloqueio de rota Admin | RF-02 | Logar como Solicitante e tentar acessar manualmente a URL `/admin`. | O sistema deve negar o acesso ou redirecionar para a Home do usuário. |

---

## Cenário 02: Abertura e Validação de Tickets
**Objetivo:** Garantir que as regras de integridade e prioridade sejam respeitadas na criação.

| ID | Caso de Teste | Requisito | Ações / Passos | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **CT-02.1** | Criação de Ticket com Sucesso | RF-04 | Preencher Título (>10 chars), Descrição e selecionar Prioridade. | Ticket salvo no banco de dados e exibido na lista com status "Aguardando atendimento". |
| **CT-02.2** | Validação de Título Curto | RN-01 | Tentar criar um ticket com título de apenas 5 caracteres. | Bloqueio do envio e exibição de erro: "O título deve conter pelo menos 10 caracteres". |
| **CT-02.3** | Atribuição de Prioridade Unificada | RN-03 | Selecionar a prioridade "P1 - Alta" no formulário de abertura. | O ticket deve ser registrado com o nível de impacto/urgência correto no PostgreSQL. |

---

## Cenário 03: Sistema de Notas (Públicas vs. Internas)
**Objetivo:** Validar a privacidade das comunicações técnicas e a precisão do contador sequencial.

| ID | Caso de Teste | Requisito | Ações / Passos | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **CT-03.1** | Visibilidade de Nota Pública | RF-06 | Analista insere uma nota marcada como "Pública" no ticket. | Tanto o Analista quanto o Solicitante conseguem ler o conteúdo da nota. |
| **CT-03.2** | Privacidade de Nota Interna | RN-05 | Analista insere uma nota marcada como "Interna" no ticket. | O Solicitante não deve visualizar a nota nem o seu conteúdo na linha do tempo. |
| **CT-03.3** | Contador Sequencial Unificado | RF-07, RN-07 | Inserir 3 notas seguidas (Pública -> Interna -> Pública). | As notas devem ser numeradas cronologicamente como Nota #1, Nota #2 e Nota #3. |
| **CT-03.4** | Isolamento de Contador por Ticket | RN-04 | Criar a "Nota #1" no Ticket A e depois a primeira nota no Ticket B. | Ambas devem ser identificadas como Nota #1 em seus respectivos contextos. |

---

## Cenário 04: Fluxo de Trabalho e Status
**Objetivo:** Validar se as transições de status seguem a regra de negócio estabelecida.

| ID | Caso de Teste | Requisito | Ações / Passos | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **CT-04.1** | Transição de Status por Analista | RF-05 | Analista assume chamado e muda de "Aguardando" para "Em atendimento". | Status atualizado com sucesso e registrado no histórico do ticket. |
| **CT-04.2** | Restrição de Status Técnico | RN-02 | Solicitante tenta alterar o status do ticket para "Tratativa Interna". | A opção não deve estar disponível para o perfil Solicitante. |
| **CT-04.3** | Fluxo Completo de Resolução | RF-05 | Percorrer todos os status até chegar em "Resolvido". | O sistema deve permitir a conclusão do chamado após todas as etapas técnicas. |

[Voltar para README](/docs/README.md)