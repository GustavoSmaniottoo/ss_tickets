# TO DO - SS Tickets

## [CONCLUÍDO]
- [x] CRUD Tickets: Criação, Listagem e Busca por ID.
- [x] CRUD Usuários: Listagem e Busca por ID implementados.
- [x] Refatoração de Tickets: Nomes de solicitante/analista com JOIN e Aliases.
- [x] Segurança: Senhas removidas de todos os retornos da API.
- [x] Infra de Testes: resetDb configurado e aplicado nos testes de tickets.
- [x] Módulo de Notas: Controller e rotas de notas finalizados.
- [x] Automação Usuários: 6 cenários validados (Cadastro, Conflito e Integridade).

## [EM ANDAMENTO: Segurança & Auth (Backend)]
- [x] Instalação: Instalar `jsonwebtoken` e `bcryptjs`.
- [x] Refatoração Cadastro: Atualizar `createUsuarios` para criptografar senha com `bcrypt.hash`.
- [x] Rota de Login: Implementar `POST /login` (Verificar user -> Comparar senha -> Gerar JWT).
- [x] Middleware de Proteção: Criar função para exigir Token nas rotas de Tickets e Usuários.
- [X] Proteger as Rotas: Aplicar o middleware auth nos arquivos de rotas de Usuários, Tickets e Notas.
- [ ] Refatorar Controllers: Alterar os métodos de criação/edição nos controllers para usarem o req.usuarioId do Token.

## [EM ANDAMENTO: Testes Automatizados (Backend)]
- [ ] Ajustar cypress/support/commands.js: Garantir que cy.createUser e cy.apiLogin usem a sintaxe de return correta e o C maiúsculo.
- [ ] Criar Custom Command cy.createTicket: Abstrair a criação de tickets para limpar as specs de Notas e de Tickets.

2. Spec de Usuários (Finalização)
- [ ] Aplicar o Loop forEach para validar campos obrigatórios (Nome, Email, Senha, Perfil).
- [ ] Aplicar o Loop de Cenários (label, extra, msg) para dados inválidos (Email sem @, Senha curta, Perfil inexistente).
- [ ] Criar os 5 testes de GET:
- [ ] Listagem Geral (validar se é array).
- [ ] Busca por ID (validar integridade).
- [ ] Erro 404 para ID inexistente.
- [ ] Validação de privacidade (garantir que não retorna senha).
- [ ] Teste de Busca com ID inválido (string).

3. Spec de Tickets (Refatoração)
- [ ] Limpar o beforeEach: Substituir o cy.request manual pelo seu comando cy.createUser.
- [ ] Implementar o Loop de Cenários no POST de tickets (Campos obrigatórios e Título < 10 caracteres).
- [ ] Refatorar os testes de PATCH (Status) para usar o novo comando de criação de tickets.

4. Spec de Notas (Refatoração)
- [ ] Refatorar o beforeEach em cascata: Usar os Custom Commands para criar o Usuário e o Ticket necessário para a nota.
- [ ] Aplicar Loop de Cenários para erros de criação de notas:
- [ ] Conteúdo vazio ou apenas espaços.
- [ ] IDs de ticket/autor não numéricos.
- [ ] Limite de 5000 caracteres.
- [ ] Ticket ou Autor inexistente.
- [ ] Refatorar teste de Sequenciamento: Garantir que a lógica de num_sequencial 1, 2, 3... está sólida.

5. Estabilização e Organização
- [ ] Remover afterAll ou afterEach que contenham resetDb (manter apenas no beforeEach para evitar o "encavalo").
- [ ] Adicionar retries no cypress.config.js para lidar com a intermitência de ambiente local.

## [PRÓXIMOS PASSOS:]
- [ ] Testes de API: Validar cenários de login (Sucesso, 401 Unauthorized).
- [ ] Automação Notas: Implementar os 15 cenários (Sucesso, Erros 400/403 e Integridade).
- [ ] Refatoração de Testes: Padronizar suítes usando `describe`/`context`.
- [ ] Custom Commands: Isolar lógica de criação de registros no Cypress.
- [ ] Normalização DB: Migrar status de Tickets para tabela `status_types`.

## [FRONT-END: Interface & Integração]
- [ ] Tela de Login: Criar HTML/CSS (Inputs estáticos).
- [ ] Persistência de Auth: Lógica para salvar Token no `localStorage`.
- [ ] Interface Base: Layout de listagem e visualização de ticket único.
- [ ] Timeline de Notas: Estrutura de "chat" para interações.
- [ ] Integração Fetch: Implementar Headers com `Authorization: Bearer <token>`.
- [ ] Validação Visual: Refletir travas do backend na UI (ex: mensagens de erro).