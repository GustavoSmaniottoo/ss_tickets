# SS Tickets - Sistema Piloto de Chamados Internos

**Empresa:** Smaniotto Solutions

**Descrição:** Sistema de gerenciamento de tickets para suporte técnico, desenvolvido como base para implementação de testes automatizados e estudos de arquitetura completa (Fullstack) voltados para QA.

## Roadmap de Desenvolvimento (Timeline)

| Fase | Descrição | Status |
| :--- | :--- | :--- |
| **01. Planeamento** | Definição de Requisitos e Cenários de Teste | ✅ Concluído |
| **02. Infraestrutura** | Configuração do ambiente Docker e PostgreSQL | ✅ Concluído |
| **03. Backend Base** | Inicialização do Node.js, Express e conexão com o Banco | ✅ Concluído |
| **04. API CRUD** | Implementação de Rotas e Controllers para Tickets | ⏳ Em progresso |
| **05. Autenticação** | Implementação de Login e Níveis de Acesso | 📅 Pendente |
| **06. Frontend** | Interface Web para abertura e gestão de tickets | 📅 Pendente |
| **07. Automação QA** | Cobertura de testes end-to-end com Cypress | 📅 Pendente |

## Progresso Atual: Módulo de Infraestrutura e Conexão

Nesta etapa, o foco foi garantir a portabilidade do ambiente entre diferentes sistemas operacionais (Windows e Linux Mint).

### Implementações Concluídas

* **Ambiente de Dados:** Configuração de contentores Docker para PostgreSQL com script de inicialização automático via init.sql.
* **Segurança de Ambiente:** Implementação de variáveis de ambiente via .env e disponibilização de .env.example para replicação segura do projeto.
* **Conexão de Banco:** Configuração de Pool de conexões utilizando o driver pg para garantir estabilidade e performance na comunicação com o banco.
* **Servidor API:** Ponto de entrada configurado em src/app.js utilizando o framework Express para gerenciamento de rotas.

## Estrutura do Projeto

A organização segue padrões de separação de responsabilidades para facilitar a manutenção e os testes futuros:

```text
SS_TICKETS/
├── docs/                  # Documentação de requisitos e planeamento de QA
├── src/                   # Código-fonte da aplicação
│   ├── config/            # Configurações de infraestrutura e banco de dados
│   │   └── db.js          # Driver de conexão com PostgreSQL
│   ├── controllers/       # Lógica de negócio e manipulação de dados
│   ├── routes/            # Definição de endpoints e rotas da API
│   └── app.js             # Arquivo principal e inicialização do servidor Express
├── .env                   # Variáveis de ambiente (dados sensíveis - ignorado pelo Git)
├── .env.example           # Modelo para configuração de novas instâncias
├── .gitignore             # Definição de ficheiros ignorados pelo controlo de versão
├── docker-compose.yml     # Orquestração do ambiente de banco de dados via Docker
├── init.sql               # Script de inicialização de tabelas e dados
└── package.json           # Manifesto de dependências e scripts do projeto
```

## Documentação de Apoio

Acesse os documentos através dos links relativos abaixo:

* [Requisitos do Sistema](/docs/requisitos.md)
* [Cenários de Teste](/docs/cenarios_de_teste.md)

## Instruções para Execução

1. Execute o ambiente de banco de dados:
   >docker-compose up -d

2. Instale as dependências base (express, pg, dotenv):
   >npm install express pg dotenv

3. Configure o ficheiro .env com as credenciais definidas no docker-compose.

4. Inicie a aplicação:
   >node src/app.js