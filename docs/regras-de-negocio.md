# Regras de Negócio — SS Tickets

Este documento descreve o que o sistema deve garantir em nível de domínio.  
É tecnicamente agnóstico: não menciona frameworks, bibliotecas, HTTP ou componentes de UI.  
Qualquer regra aqui deve ser aplicada independentemente de onde a operação é iniciada.

---

## 1. Domínio

### 1.1 Perfis de usuário

O sistema reconhece três perfis com responsabilidades distintas:

| ID | Nome | Responsabilidade principal |
|----|------|---------------------------|
| 1 | Solicitante | Abre tickets e acompanha o atendimento |
| 2 | Analista | Atende e resolve tickets |
| 3 | Admin | Gerencia o sistema e tem acesso irrestrito |

### 1.2 Ciclo de vida do ticket

Um ticket percorre os seguintes status, nesta ordem recomendada (transições fora da ordem não são bloqueadas, exceto onde explicitado):

```
Aguardando atendimento → Em atendimento → Aguardando cliente
                                        → Respondido
                                        → Tratativa Interna
                                        → Resolvido → Fechado
```

**Status finalizados:** `Resolvido` e `Fechado`. Tickets nesse estado não aceitam mais modificações.

### 1.3 Prioridades

Um ticket deve obrigatoriamente ter uma das três prioridades:

| Código | Significado |
|--------|-------------|
| P1 | Crítica |
| P2 | Média |
| P3 | Baixa |

---

## 2. Regras de Identidade e Autenticação

**RN-ID-01 — Unicidade de e-mail:** Dois usuários não podem ter o mesmo endereço de e-mail cadastrado.

**RN-ID-02 — Armazenamento seguro de senha:** Senhas não podem ser armazenadas em texto plano. Devem passar por um algoritmo de hash antes de serem persistidas.

**RN-ID-03 — Identidade da operação:** A identidade do usuário que cria um ticket ou adiciona uma nota deve ser extraída da sessão autenticada, nunca de dados fornecidos pelo próprio usuário no corpo da requisição.

---

## 3. Regras de Acesso por Perfil

**RN-ACESSO-01 — Listagem de usuários:** Apenas Analistas e Admins podem listar ou consultar dados de outros usuários. Um Solicitante só pode consultar os próprios dados.

**RN-ACESSO-02 — Visibilidade de tickets:** Cada perfil vê os tickets de acordo com seu contexto:
- **Solicitante** vê apenas os próprios tickets.
- **Analista e Admin** veem todos os tickets.

**RN-ACESSO-03 — Assumir ticket:** Apenas Analistas e Admins podem assumir um ticket (tornar-se o analista responsável). Um Solicitante não pode executar essa ação.

**RN-ACESSO-04 — Alteração de status:** Um Solicitante pode apenas alterar o status do próprio ticket para `Fechado`. Todos os outros status são de controle exclusivo de Analistas e Admins.

**RN-ACESSO-05 — Notas em tickets alheios:** Um Solicitante não pode adicionar notas a tickets de outros solicitantes.

---

## 4. Regras de Validação de Dados

**RN-VAL-01 — Título do ticket:** O título é obrigatório e deve ter no mínimo 10 caracteres.

**RN-VAL-02 — Prioridade do ticket:** O campo prioridade é obrigatório e aceita apenas os valores `P1`, `P2` ou `P3`.

**RN-VAL-03 — Conteúdo de nota:** O conteúdo de uma nota é obrigatório, não pode ser apenas espaços em branco e tem limite máximo de 5.000 caracteres.

**RN-VAL-04 — Senha:** A senha deve ter no mínimo 6 e no máximo 128 caracteres.

**RN-VAL-05 — E-mail:** O e-mail deve ser um endereço válido no formato `usuario@dominio.ext`.

---

## 5. Regras de Ciclo de Vida

**RN-CICLO-01 — Bloqueio de tickets finalizados:** Tickets com status `Resolvido` ou `Fechado` não aceitam adição de novas notas nem alteração de status.

**RN-CICLO-02 — Atribuição automática ao assumir:** Quando um Analista assume um ticket sem responsável, o status é automaticamente alterado para `Em atendimento`. Se o ticket já tiver um analista, o status permanece inalterado — apenas a atribuição de responsável muda.

**RN-CICLO-03 — Sequenciamento de notas:** Cada nota possui um número sequencial calculado por ticket. O primeiro número sempre será 1, e cada nota subsequente no mesmo ticket incrementa o contador independentemente de outros tickets.

---

## 6. Regras de Visibilidade de Notas

**RN-VIS-01 — Notas internas:** Notas marcadas como internas (`is_internal = true`) são de uso técnico exclusivo. Usuários com perfil Solicitante não devem ter acesso ao conteúdo dessas notas.

> **Status de implementação:** Esta regra está especificada mas ainda não implementada no backend. A filtragem por `is_internal` deve ser aplicada na consulta de notas antes do próximo release do frontend.
