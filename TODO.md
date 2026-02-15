# SS Tickets - Planeamento e Progresso

## 1. Arquitetura e Infraestrutura
- [x] **Estrutura Monorepo:** Organização do projeto dividida em `packages/backend` e `packages/frontend` utilizando NPM Workspaces.
- [x] **Base de Dados Dockerizada:** PostgreSQL configurado via Docker Compose com persistência de dados.
- [x] **Automação de Schema:** Implementação do ficheiro `init.sql` com a criação de tabelas e sementes (seeds) iniciais.
- [x] **Ambiente de Testes:** Integração do Cypress com a base de dados para limpeza automática via `task resetDb`.

## 2. Backend e Segurança
- [x] **Servidor Express:** Configuração de middlewares para CORS, JSON e tratamento de erros de sintaxe.
- [x] **Autenticação JWT:** Implementação do fluxo de login, geração de tokens e middleware para proteção de rotas privadas.
- [x] **Criptografia:** Proteção de passwords utilizando a biblioteca `bcryptjs`.
- [x] **Refatoração de Identidade (Segurança):**
    - [x] **Tickets:** Identificação automática do solicitante através do Token JWT.
    - [x] **Notas:** Identificação automática do autor através do Token JWT.
    - [x] **Payloads Limpos:** Remoção de IDs manuais no corpo das requisições para garantir a integridade da identidade.

## 3. Testes e Qualidade
- [x] **Módulo de Utilizadores:** Testes de criação, login e restrição de acesso.
- [x] **Módulo de Tickets:** Cobertura de criação, listagem, procura por ID e atualização de estado.
- [x] **Módulo de Notas:** Validação de sequenciamento independente por ticket e bloqueio de interações em tickets resolvidos.
- [x] **Sincronização de Erros:** Ajuste das mensagens de validação entre os Controllers e as Specs do Cypress.

## 4. Frontend - React (Próximo Passo)
- [ ] **Setup do Projeto:** Inicializar React + Vite na pasta `packages/frontend`.
- [ ] **Ligação com a API:** Configurar a comunicação entre o Frontend e o Backend (Porta 3000).
- [ ] **Sistema de Autenticação:** Criação de ecrãs de Login e armazenamento seguro do Token.
- [ ] **Interface de Tickets:** Desenvolvimento do Dashboard e visualização detalhada com histórico de notas.

---

### Notas de Versão
> O projeto utiliza uma arquitetura de Monorepo, garantindo que o Backend e o Frontend partilhem o mesmo ecossistema de desenvolvimento. O Backend está testado e pronto para consumo.