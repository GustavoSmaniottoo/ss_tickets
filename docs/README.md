# SS Tickets 

O SS Tickets nasceu de um momento de introspecção.

Como eu faço pra colocar em prática as coisas que aprendo em cursos, na faculdade, nos estudos pra CTFL?

Pensei em criar algo que eu domino o fluxo por completo, e como eu passei grande parte da minha carreira atendendo e resolvendo tickets, por que não construir um sistema nessa linha?

A ideia virou rascunho, o rascunho virou projeto, e após algumas elaborações e refinamentos usando IA pra organizar o caminho, aqui estamos.

Um sistema de gestão de chamados fullstack, construído do zero, com backend, frontend e testes automatizados com Cypress.

Mas com uma regra de ouro: **Nenhum código entra no projeto sem antes eu entender e conseguir explicar o que ele faz.**

> Stack: Node.js · Express · PostgreSQL · React · Vite · Cypress · JWT · Docker

## Documentação de Apoio

Antes de escrever qualquer código, o projeto passou por uma fase de análise e especificação.

Os requisitos foram levantados e organizados em Requisitos Funcionais (RF), Não-Funcionais (RNF) e Regras de Negócio (RN), o mesmo modelo usado em análise de sistemas.

A partir desses requisitos, os cenários de teste foram escritos em formato Gherkin (BDD), servindo tanto como guia de desenvolvimento quanto como base para a automação no Cypress.

> Na prática, a API REST saiu antes das specs formais. O BDD veio da necessidade de organizar o que já havia sido construído e estabelecer uma base clara para o desenvolvimento do frontend, que é a camada com que tenho menos familiaridade.


Acesse a documentação detalhada na pasta `/docs`:

* **[Especificação de Requisitos](/docs/requirements.md)**: Organização de Requisitos Funcionais (RF), Não-Funcionais (RNF) e Regras de Negócio (RN).
* **[Especificação de Comportamento (BDD)](/docs/specs.md)**: Cenários de teste em formato Gherkin que servem como guia para o desenvolvimento e para a automação no Cypress.

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