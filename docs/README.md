# SS Tickets - Sistema de gestão de chamados

O SS tickets é um projeto pessoal focado nos fundamentos do desenvolvimento e qualidade de software.

A proposta é uma implementação enxuta e totalmente documentada, priorizando o "básico bem feito" para garantir um sistema simples, estável e escalável.

## Documentação de apoio:

Aqui você pode dar uma olhada nos [requisitos do Sistema](/docs/requisitos.md), organizados em:

* Requisitos funcionais
* Não funcionais 
* Regras de negócio

## Tecnologias

**Node.js & Express:** Backend em JavaScript com Express para facilitar a organização das rotas da API.

**PostgreSQL:** Banco de dados relacional rubusto .

**Docker:** Utilizado por enquanto para gerenciar o container do PostgreSQL.

**Cypress:** Testes E2E em JS pra falar a mesma língua do sistema e deixar tudo bem automatizado.

## Como executar o projeto

### Você vai precisar ter na sua maquina:
* [ ] **Node.js** (v18 ou superior)
* [ ] **Docker & Docker Compose**
* [ ] **Git**

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/GustavoSmaniottoo/ss_tickets.git && cd ss_tickets
   ```

2. **Suba o banco de dados (Docker):**
   ```bash
   docker-compose up -d
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Configure o ambiente:**
   Crie um arquivo `.env` na raiz do projeto e configure as credenciais do banco.

5. **Inicie a aplicação:**
   ```bash
   npm run dev
   ```
6. **Testes Automatizados:**

   Com a aplicação em execução (`npm run dev`), utilize os comandos abaixo para rodar a suíte de testes do Cypress:


   **Modo Interface (Visual):**
   ```bash
   npm run cy:open
   ```

     **Modo Headless (Terminal):**
   ```bash
   npm run cy:test
   ```


