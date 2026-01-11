# Backlog SS Tickets - Módulo Usuários & Testes

## 1. Concluir o "Enxergável" (Visibilidade)
- [ ] Implementar `getUsuarios` no `usuarioController.js` (campos: id, nome, email, perfil_id).
- [ ] Implementar `getUsuarioById` no `usuarioController.js` (validar se o ID é número).
- [ ] Atualizar `usuarioRoutes.js` com as rotas de GET (Lista e Por ID).

## 2. Preparar a "Cama" para os Testes (Infraestrutura)
- [ ] Configurar Task `resetDb` no `cypress.config.js` (comando TRUNCATE para limpar o lixo de teste).

## 3. Iniciar a Automação (SDET Mode)
- [ ] Criar teste de Cadastro: Caminho Feliz (Status 201).
- [ ] Criar teste de Cadastro: E-mail Duplicado (Status 409).
- [ ] Criar teste de Listagem: Validar se retorna os usuários criados.

## 4. Pontos de Atenção (Melhorias Futuras)
- [ ] Refatorar `GET /tickets` para incluir nomes de solicitante/analista com JOIN.
- [ ] Adicionar `perfil_nome` na listagem de usuários usando INNER JOIN.