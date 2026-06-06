# Contrato de API — SS Tickets

Este documento descreve como o backend expõe as regras de negócio via HTTP.  
É o contrato entre o servidor e qualquer consumidor (frontend, testes, integrações).  
As regras que justificam cada restrição estão em [`regras-de-negocio.md`](./regras-de-negocio.md).

---

## 1. Autenticação

Todos os endpoints marcados com 🔒 exigem o header:

```
Authorization: Bearer <token>
```

O token é obtido via `POST /usuarios/login` e expira em **1 hora**.  
O payload do token contém: `{ id: number, perfil: number }`.

Respostas de autenticação:

| Código | Situação |
|--------|----------|
| `401` | Token ausente, malformado ou expirado |
| `403` | Token válido, mas o perfil não tem permissão para a operação |

---

## 2. Formato de Erros

Todas as respostas de erro seguem o formato:

```json
{ "error": "Mensagem descritiva do erro." }
```

---

## 3. Endpoints

### 3.1 Usuários — `/usuarios`

---

#### `POST /usuarios` — Cadastrar usuário

Cria uma nova conta. Público, não requer autenticação.

**Request body:**
```json
{
  "nome": "string",
  "email": "string",
  "senha": "string",
  "perfil_id": 1 | 2 | 3
}
```

**Responses:**

| Código | Situação | Body |
|--------|----------|------|
| `201 Created` | Usuário criado | `{ id, nome, email, perfil_id }` |
| `400 Bad Request` | Campo ausente, e-mail inválido, senha < 6 chars, senha > 128 chars, ou `perfil_id` inexistente | `{ "error": "..." }` |
| `409 Conflict` | E-mail já cadastrado | `{ "error": "..." }` |

> A senha **não** é retornada no body de sucesso. Ver `RN-ID-02`.

---

#### `POST /usuarios/login` — Autenticar usuário

Valida credenciais e retorna um JWT. Público, não requer autenticação.

**Request body:**
```json
{
  "email": "string",
  "senha": "string"
}
```

**Responses:**

| Código | Situação | Body |
|--------|----------|------|
| `200 OK` | Login bem-sucedido | `{ "message": "...", "token": "jwt_string" }` |
| `400 Bad Request` | Campo ausente ou e-mail inválido | `{ "error": "..." }` |
| `401 Unauthorized` | Credenciais incorretas | `{ "error": "..." }` |

> A mensagem de erro de credenciais é genérica ("E-mail ou senha inválidos") para não revelar qual campo está errado.

---

#### `GET /usuarios` 🔒 — Listar usuários

Retorna todos os usuários com o nome do perfil. Restrito a Analistas e Admins. Ver `RN-ACESSO-01`.

**Responses:**

| Código | Situação | Body |
|--------|----------|------|
| `200 OK` | Lista retornada | `[{ id, usuario_nome, email, perfil_id, perfil }]` |
| `403 Forbidden` | Solicitante tentou acessar | `{ "error": "..." }` |

---

#### `GET /usuarios/:id` 🔒 — Buscar usuário por ID

Retorna os dados de um usuário específico. Um Solicitante só pode consultar o próprio ID. Ver `RN-ACESSO-01`.

**Responses:**

| Código | Situação | Body |
|--------|----------|------|
| `200 OK` | Usuário encontrado | `{ id, usuario_nome, email, perfil_id, perfil }` |
| `400 Bad Request` | `:id` não é numérico | `{ "error": "..." }` |
| `403 Forbidden` | Solicitante tentou consultar outro usuário | `{ "error": "..." }` |
| `404 Not Found` | Usuário não existe | `{ "error": "..." }` |

---

### 3.2 Tickets — `/tickets`

---

#### `POST /tickets` 🔒 — Criar ticket

Cria um novo ticket. O `solicitante_id` é extraído do token, nunca do body. Ver `RN-ID-03`.

**Request body:**
```json
{
  "titulo": "string (mínimo 10 chars)",
  "descricao": "string",
  "prioridade": "P1" | "P2" | "P3"
}
```

**Responses:**

| Código | Situação | Body |
|--------|----------|------|
| `201 Created` | Ticket criado | Objeto completo do ticket |
| `400 Bad Request` | Campo ausente, título < 10 chars, prioridade fora do domínio | `{ "error": "..." }` |

---

#### `GET /tickets` 🔒 — Listar tickets

Retorna tickets com dados de solicitante e analista (via JOIN). Filtrável por `?sem_analista=true` para a fila de atendimento.

Solicitantes recebem apenas os próprios tickets. Analistas e Admins recebem todos. Ver `RN-ACESSO-02`.

**Query params:**

| Parâmetro | Tipo | Efeito |
|-----------|------|--------|
| `sem_analista` | `"true"` | Filtra apenas tickets sem analista atribuído |

**Response `200 OK`:**
```json
[{
  "id": 1,
  "solicitante_id": 1,
  "solicitante_nome": "string",
  "analista_id": null | number,
  "analista_nome": null | "string",
  "titulo": "string",
  "descricao": "string",
  "prioridade": "P1" | "P2" | "P3",
  "status": "string",
  "created_at": "timestamp"
}]
```

---

#### `GET /tickets/:ticketId` 🔒 — Buscar ticket por ID

Retorna um ticket específico com dados de solicitante e analista.

**Responses:**

| Código | Situação |
|--------|----------|
| `200 OK` | Ticket encontrado — mesmo schema do item de lista |
| `400 Bad Request` | `:ticketId` não é numérico |
| `404 Not Found` | Ticket não existe |

---

#### `PATCH /tickets/:ticketId` 🔒 — Atualizar ticket

Dois comportamentos distintos controlados pelo campo `acao`:

**— Assumir ticket** (`acao: "assumir"`)

Atribui o analista autenticado ao ticket. Ver `RN-ACESSO-03` e `RN-CICLO-02`.

```json
{ "acao": "assumir" }
```

| Código | Situação |
|--------|----------|
| `200 OK` | Ticket atualizado — objeto completo |
| `403 Forbidden` | Solicitante tentou assumir |
| `404 Not Found` | Ticket não existe |

**— Alterar status** (sem `acao`, com `status`)

Atualiza o status do ticket. Solicitante só pode definir `Fechado` e apenas no próprio ticket. Ver `RN-ACESSO-04`.

```json
{ "status": "Em atendimento" }
```

**Status válidos:** `Aguardando atendimento`, `Em atendimento`, `Aguardando cliente`, `Respondido`, `Tratativa Interna`, `Resolvido`, `Fechado`.

| Código | Situação |
|--------|----------|
| `200 OK` | Status atualizado — objeto completo |
| `400 Bad Request` | Status fora do domínio ou `:ticketId` não numérico |
| `403 Forbidden` | Solicitante tentou alterar para status proibido ou ticket de outro solicitante |
| `404 Not Found` | Ticket não existe |

---

### 3.3 Notas — `/notas` e `/tickets/:ticket_id/notas`

---

#### `POST /notas` 🔒 — Criar nota

Adiciona uma nota a um ticket. O `autor_id` é extraído do token. Ver `RN-ID-03`, `RN-CICLO-01`, `RN-VAL-03`.

**Request body:**
```json
{
  "ticket_id": "number",
  "conteudo": "string (máximo 5000 chars)",
  "is_internal": false | true
}
```

> `is_internal` é opcional — padrão `false`.

**Responses:**

| Código | Situação | Body |
|--------|----------|------|
| `201 Created` | Nota criada | Objeto completo da nota com `num_sequencial` |
| `400 Bad Request` | Campo ausente, `ticket_id` não numérico, conteúdo vazio ou > 5000 chars | `{ "error": "..." }` |
| `403 Forbidden` | Ticket com status `Resolvido` ou `Fechado` | `{ "error": "..." }` |
| `404 Not Found` | Ticket não existe | `{ "error": "..." }` |

---

#### `GET /tickets/:ticket_id/notas` 🔒 — Listar notas de um ticket

Retorna todas as notas do ticket ordenadas por `num_sequencial ASC`.  
Notas com `is_internal = true` **não** são retornadas para usuários com perfil Solicitante. Ver `RN-VIS-01`.

**Responses:**

| Código | Situação | Body |
|--------|----------|------|
| `200 OK` | Lista retornada | `[{ num_sequencial, conteudo, created_at, autor_nome, autor_id }]` |
| `400 Bad Request` | `:ticket_id` não numérico | `{ "error": "..." }` |
| `404 Not Found` | Ticket não existe | `{ "error": "..." }` |

---

### 3.4 Sistema — `/health`

---

#### `GET /health` — Health check

Verifica se o backend e o banco de dados estão acessíveis. Público.

**Response `200 OK`:**
```json
{
  "status": "Online",
  "message": "Backend e Banco de Dados conectados!",
  "db_time": "timestamp"
}
```

**Response `500 Internal Server Error`:** Banco inacessível.
