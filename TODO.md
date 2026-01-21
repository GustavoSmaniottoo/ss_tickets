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
- [x] **Instalação:** Instalar `jsonwebtoken` e `bcryptjs`.
- [ ] **Refatoração Cadastro:** Atualizar `createUsuarios` para criptografar senha com `bcrypt.hash`.
- [ ] **Rota de Login:** Implementar `POST /login` (Verificar user -> Comparar senha -> Gerar JWT).
- [ ] **Middleware de Proteção:** Criar função para exigir Token nas rotas de Tickets e Usuários.
- [ ] **Testes de API:** Validar cenários de login (Sucesso, 401 Unauthorized).

## [PRÓXIMOS PASSOS: Automação & Refatoração]
- [ ] **Automação Notas:** Implementar os 15 cenários (Sucesso, Erros 400/403 e Integridade).
- [ ] **Refatoração de Testes:** Padronizar suítes usando `describe`/`context`.
- [ ] **Custom Commands:** Isolar lógica de criação de registros no Cypress.
- [ ] **Normalização DB:** Migrar status de Tickets para tabela `status_types`.

## [FRONT-END: Interface & Integração]
- [ ] **Tela de Login:** Criar HTML/CSS (Inputs estáticos).
- [ ] **Persistência de Auth:** Lógica para salvar Token no `localStorage`.
- [ ] **Interface Base:** Layout de listagem e visualização de ticket único.
- [ ] **Timeline de Notas:** Estrutura de "chat" para interações.
- [ ] **Integração Fetch:** Implementar Headers com `Authorization: Bearer <token>`.
- [ ] **Validação Visual:** Refletir travas do backend na UI (ex: mensagens de erro).