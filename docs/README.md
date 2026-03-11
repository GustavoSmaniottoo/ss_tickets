# SS Tickets - Gestão de Chamados

O SS Tickets é um projeto fullstack focado nos fundamentos do desenvolvimento e qualidade de software (SDET focus). A proposta é uma implementação enxuta e totalmente documentada, priorizando o "básico bem feito" para garantir um sistema simples, estável e escalável.

## Documentação de Apoio

Acesse a documentação detalhada na pasta `/docs`:

* **[Especificação de Requisitos](/docs/requirements.md)**: Organização de Requisitos Funcionais (RF), Não-Funcionais (RNF) e Regras de Negócio (RN).
* **[Especificação de Comportamento (BDD)](/docs/specs.md)**: Cenários de teste em formato Gherkin que servem como guia para o desenvolvimento e para a automação no Cypress.

## Estrutura do Projeto (Monorepo)

O projeto utiliza **npm workspaces** para gerenciar as camadas da aplicação em um único repositório:

* **`packages/backend`**: API RESTful desenvolvida com Node.js e Express.
* **`packages/frontend`**: Interface SPA moderna utilizando React e Vite.
* **`cypress/`**: Suíte de testes automatizados integrada.

## Tecnologias

* **Runtime**: Node.js (v18 ou superior).
* **Banco de Dados**: PostgreSQL rodando via Docker.
* **Segurança**: Autenticação via JWT (JSON Web Token).
* **Testes**: Cypress para automação E2E (End-to-End).

## Como Executar

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/GustavoSmaniottoo/ss_tickets.git && cd ss_tickets
    ```

2.  **Instale as dependências (na raiz do projeto):**
    ```bash
    npm install
    ```
    *Este comando instala as dependências de todos os pacotes do workspace simultaneamente.*

3.  **Suba o banco de dados via Docker:**
    ```bash
    docker-compose up -d
    ```

4.  **Configure o ambiente:**
    Crie um arquivo `.env` na raiz do projeto (conforme o modelo de exemplo) para configurar as credenciais do banco e a chave secreta do JWT.

5.  **Inicie a aplicação (Backend + Frontend):**
    ```bash
    npm run dev
    ```
    *Utiliza o `concurrently` para subir os dois serviços em um único terminal.*

## Testes Automatizados

Com a aplicação em execução, utilize os comandos abaixo na raiz para rodar os testes:

* **Modo Interface (Visual):**
    ```bash
    npm run cy:open
    ```

* **Modo Headless (Terminal):**
    ```bash
    npm run cy:test
    ```