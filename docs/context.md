# SS Tickets - Contexto do Projeto (Atualizado)
Atualizado em 2026-03-20.

## Visao geral
- Monorepo Node.js com backend em Express, frontend React/Vite e testes E2E com Cypress.
- Banco PostgreSQL via Docker Compose, com schema e seed inicial em init.sql.
- Autenticacao com JWT e senha criptografada com bcrypt.
- Frontend SPA com rotas protegidas e integracao via Axios (token Bearer).

## Estrutura (resumo)
```
.
├─ cypress.config.js
├─ docker-compose.yml
├─ init.sql
├─ package.json
├─ TODO.md
├─ cypress/
│  ├─ e2e/
│  ├─ fixtures/
│  ├─ screenshots/
│  └─ support/
├─ docs/
└─ packages/
   ├─ backend/
   └─ frontend/
```

## Pacotes e scripts
### Root (workspaces)
- Workspaces: packages/*
- Scripts:
  - backend:dev -> npm run dev -w packages/backend
  - frontend:dev -> npm run dev -w packages/frontend
  - dev -> concurrently "npm run backend:dev" "npm run frontend:dev"
  - cy:open -> cypress open
  - cy:test -> cypress run
- Dependencias relevantes: concurrently, cypress, axios, react-router-dom.

### Backend (packages/backend)
- Scripts:
  - start -> node src/app.js
  - dev -> nodemon src/app.js
- Dependencias principais: express, pg, dotenv, cors, bcryptjs, jsonwebtoken.

### Frontend (packages/frontend)
- Scripts:
    - dev -> vite
    - build -> vite build
    - preview -> vite preview
- Dependencias principais: react, react-dom.
- Dev dependencies principais: vite, eslint, @vitejs/plugin-react.

## Backend - principais modulos
### App e middlewares
- app.js
  - Express + CORS + JSON parser.
  - Middleware para JSON malformado.
  - Rotas: /tickets, /usuarios, /notas, /health.
- middlewares/authMiddleware.js
  - Valida header Authorization no formato Bearer.
  - Decodifica JWT e injeta req.usuarioId e req.usuarioPerfil.

### Config de banco
- config/db.js
  - Pool do pg com variaveis do .env.
  - Exporta helper query(text, params).

### Controllers
- controllers/usuarioController.js
  - createUsuario: valida campos, email, senha, hash com bcrypt.
  - getUsuarios / getUsuarioById: lista com join em perfis.
  - login: valida email/senha e gera JWT.
- controllers/ticketController.js
  - createTicket: usa req.usuarioId como solicitante_id (Token).
  - getTickets: lista com joins de solicitante e analista.
  - getTicketById: valida id e retorna join.
  - updateStatusTicket: valida status permitido.
- controllers/notaController.js
  - createNota: usa req.usuarioId como autor_id (Token).
  - getNotasByTicket: lista notas com autor e sequencia.

### Rotas
- routes/usuarioRoutes.js
  - POST /usuarios
  - POST /usuarios/login
  - GET /usuarios (auth)
  - GET /usuarios/:id (auth)
- routes/ticketRoutes.js
  - POST /tickets (auth)
  - GET /tickets (auth)
  - GET /tickets/:ticketId (auth)
  - PATCH /tickets/:ticketId (auth)
  - GET /tickets/:ticket_id/notas (auth)
- routes/notaRoutes.js
  - POST /notas (auth)

## Frontend - principais modulos
### App e rotas
- App.jsx
    - React Router com rotas publicas: /, /login, /cadastro.
    - Rotas privadas: /meus-chamados e /fila-global via ProtectedRoute.
    - ProtectedRoute verifica token no localStorage.
    - Rotas privadas ainda sao stubs (divs simples).

### Paginas
- pages/Home.jsx
    - Landing simples com links para login e cadastro.
- pages/Login.jsx
    - Login via Axios em /usuarios/login e armazenamento de token.
    - Redireciona para /meus-chamados apos sucesso.
- pages/Cadastro.jsx
    - Cadastro via Axios em /usuarios com perfil_id padrao 1.
    - Redireciona para /login apos sucesso.
    - Telas de tickets (lista/detalhe) ainda nao implementadas.

### API e bootstrap
- api/api.js
    - Axios com baseURL hardcoded em http://localhost:3000.
    - Interceptor injeta Authorization Bearer com token do localStorage.
- main.jsx
    - Renderiza App em StrictMode.

## Fluxo de autenticacao (frontend)
- Login salva o JWT em localStorage com a chave token.
- ProtectedRoute checa token e redireciona para /login se ausente.
- Axios injeta o header Authorization: Bearer <token> em cada request.

### Health check
- GET /health
  - Consulta simples ao banco e retorna status.

## Banco de dados
- docker-compose.yml levanta Postgres 15 e carrega init.sql.
- init.sql cria tabelas:
    - perfis, usuarios, tickets, notas (com is_internal e num_sequencial).
- Seeds iniciais:
  - perfis: Solicitante, Analista, Admin.
  - usuarios e tickets de exemplo.

## Variaveis de ambiente
- .env.example (root) indica:
  - DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT, JWT_SECRET.
- cypress.config.js carrega ./packages/backend/.env para os testes.

## Cypress (E2E)
### Config
- cypress.config.js
  - baseUrl: http://localhost:3000
  - task resetDb: TRUNCATE notas, tickets, usuarios.

### Custom commands
- cypress/support/commands.js
  - apiLogin, createUsuario, createTicket, createNota.

### Specs
- cypress/e2e/healthcheck.cy.js
  - Valida /health.
- cypress/e2e/usuarios.cy.js
  - CRUD parcial, validacoes e acesso privado com token.
- cypress/e2e/tickets.cy.js
  - Criacao, busca, listagem, validacoes e patch de status.
- cypress/e2e/notas.cy.js
  - Criacao, sequenciamento e regras de validacao.

## Documentacao
- docs/README.md: visao geral e como rodar.
- docs/requirements.md: requisitos e regras de negocio.
- docs/specs.md: cenarios BDD.

## TODO / Roadmap
- Ver TODO.md para progresso de infra, backend e front-end.
- Nota: o frontend possui setup Vite + telas basicas (home/login/cadastro), mas as rotas privadas ainda sao stubs.

## Copia completa - app e controllers

### packages/backend/src/app.js
```javascript
const express = require('express'); //Importo o framework Express da pasta node_modules
const cors = require('cors'); // Importa o middleware para permitir requisições de fora do servidor
const db = require('./config/db'); //chamo do diretorio config o arquivo db.js para utilizar a função query
const app = express();//Inicializo o Express, é como uma instância do Express de onde eu posso chamar várias funcionalidades do framework
const ticketRoutes = require('./routes/ticketRoutes'); //importo as rotas de tickets
const usuarioRoutes = require('./routes/usuarioRoutes'); //importo as rotas de usuarios
const notaRoutes = require('./routes/notaRoutes'); //importo as rotas de usuarios


app.use(cors()); // Libera o acesso para que o seu HTML consiga consultar a API

/** Basicamente criamos um middleware global, onde o express vai automaticamente interpretar qualquer requisição como JSON
  * o app é a instância do Express criada acima
  * o .use() serve para configurar middlewares no Express
  * o express.json() é um middleware que faz magica de pegar o corpo da requisição e transformar em um objeto JavaScript acessível via req.body*/
app.use(express.json());

/**Middleware para capturar erros de JSON malformado
* essa sintaxe recebendo quatro parâmetros indica que é um middleware de tratamento de erros no Express
* estou verificando dentro do err se ele é uma instância de SyntaxError (erro de sintaxe) e se o status é 400 (bad request) e se o corpo do erro contém a propriedade 'body'
* se todas essas condições forem verdadeiras, significa que houve um erro de sintaxe ao tentar interpretar o JSON enviado na requisição
* nesse caso, respondo com um status 400 e uma mensagem de erro informando que o JSON está malformado
* se o erro não for relacionado a JSON malformado, chamo o next() para passar o controle para o próximo middleware de tratamento de erros (se houver)
*/
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: "JSON malformado. Verifique a sintaxe." });
    }
    next();
});

app.use('/tickets', ticketRoutes); /**o app.use() pede dois parâmetros: 
* a rota base e o roteador (router) que vai lidar com as requisições para essa rota
* no caso o ticketRoutes que foi importado acima*/

app.use('/usuarios', usuarioRoutes); /**o app.use() pede dois parâmetros: 
* a rota base e o roteador (router) que vai lidar com as requisições para essa rota
* no caso o usuarioRoutes que foi importado acima*/ 

app.use('/notas', notaRoutes); /**o app.use() pede dois parâmetros: 
* a rota base e o roteador (router) que vai lidar com as requisições para essa rota
* no caso o usuarioRoutes que foi importado acima*/ 

/**Rota de Teste: é o Health Check para verificar se o backend e o banco de dados estão funcionando
  * aqui basicamente eu crio uma rota GET em /health que tenta fazer uma consulta simples ao banco de dados
  * decidi manter essa rota no app.js como um ponto central de verificação do sistema, caso surjam novas funcionalidades de sistema eu crio um SystemRoutes.js separado*/
app.get('/health', async (req, res) => { //o app.get() cria uma rota do tipo GET que tambem recebe dois parametros: a rota e a funcao que sera executada quando houver uma requisicao pra ela
  try {
    const result = await db.query('SELECT NOW()'); // Pergunta a hora atual ao banco e ja armazena na constante result
    res.json({ //retorno a resposta em formato JSON
      status: 'Online',
      message: 'Backend e Banco de Dados conectados!',
      db_time: result.rows[0].now //aqui é o resultado da consulta ao banco de dados
    });
  } catch (err) { //caso ocorra algum erro na conexao com o banco, o catch captura esse erro
    res.status(500).json({ error: 'Erro ao conectar ao banco: ' + err.message }); 
    //o res.status(500) define o código de status HTTP da resposta como 500 (internal server error)
    //o .json() envia uma resposta em formato JSON com a mensagem de erro + o erro capturado 
  }
});

const PORT = 3000; //defino uma constante para guardar a porta onde o servidor vai rodar
app.listen(PORT, () => { 
/** O listen inicia o servidor na porta definida, porém ele demora alguns milissegundos pra iniciar
  * por isso a funcao de callback
  * Ela vai exibir a mensagem abaixo quando o servidor estiver rodando*/
  console.log(`Pra cima! Servidor da Smaniotto Solutions rodando em http://localhost:${PORT}`);
});
```

### packages/backend/src/controllers/usuarioController.js
```javascript
//primeiro preciso importar a conexão com o banco
const db = require('../config/db'); //connfiguração do banco de dados
const bcrypt = require('bcryptjs'); //importo o bcryptjs para fazer o hash da senha do usuário
const jwt = require('jsonwebtoken'); //aqui importo o jsonwebtoken para criar tokens JWT para autenticação

require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;

///Crio a constante usuarioController que vai agrupar todas as funções relacionadas a usuários
const usuarioController = { //a constante vai ser um objeto que contém várias funções, e vou exportar esse objeto no final do arquivo

    //função para criar um novo usuário 
    createUsuario: async (req, res) =>{//o req e o res são os objetos de requisição e resposta do Express obrigatórios em qualquer rota ou controller do Express

        try{

        const { nome, email, senha, perfil_id } = req.body;
        //extraio os dados que o usuário vai enviar no body da requisição com base no que está definido no banco de dados

        //valido se todos os campos obrigatórios foram fornecidos
        if(!nome || !email || !senha || !perfil_id){//inverto o valor com o ! para verificar se está vazio ou indefinido
            return res.status(400).json({error: "Todos os campos são obrigatórios."});//se algum campo estiver vazio, retorno um erro 400 (bad request) com uma mensagem de erro
        }

         //valido se a senha possui pelo menos 6 caracteres
        if (senha.length < 6) {
            return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });                            
        }

        //valido se o email é válido (simples validação)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Email inválido." });
        }
        //faço o hash da senha antes de armazená-la no banco de dados
        const salt = await bcrypt.genSalt(10); //gero um salt com 10 rounds para aumentar a segurança do hash
        const senhaHash =  await bcrypt.hash(senha, salt); //faço o hash da senha usando o salt gerado

        
        //monto a query SQL para inserir o novo usuário no banco de dados
        //a const query será chamada na função query do db.js como argumento
        const query = ` 
                INSERT INTO usuarios (nome, email, senha, perfil_id)
                VALUES ($1, $2, $3, $4)
                RETURNING id, nome, email, perfil_id
            `; //importante não retornar a senha no RETURNING por questões de segurança
        
        const values = [nome, email, senhaHash, perfil_id];//array com os valores que vão substituir os placeholders $1, $2, $3 e $4 na query

        const result = await db.query(query, values);//chamo a função query importada do db.js passando a query e os valores

        //resposta de sucesso (201 Created)
        return res.status(201).json(result.rows[0]);
        /**o res.status(201) define o código de status HTTP da resposta como 201 (Created)
         * o .json() envia uma resposta em formato JSON com os dados do usuário criado (result.rows[0])
         * é seguro utilizar o index 0 porque o RETURNING * sempre retorna um único registro
         * ou seja vou retornar
         *  para o cliente os dados do usuário que acabou de ser criado no banco de dados
         */
        } catch (error) {

        console.error("Erro ao criar usuário:", error);//exibo o erro no console do servidor para ajudar na depuração

            //verifico se o erro é de violação de chave única (email duplicado) 
            if (error.code === '23505') { //o erro 23505 indica violação de chave única no PostgreSQL
                return res.status(409).json({ 
                    error: "Conflito de dados",  //esse campo 'error' é o nome da chave no objeto JSON que estou enviando na resposta   
                    message: "Este e-mail já está cadastrado no sistema." 
                    });
                }
            //verifico se o erro é de violação de chave estrangeira (perfil_id inválido)        
            if (error.code === '23503') { //o erro 23503 indica violação de chave estrangeira no PostgreSQL
                return res.status(400).json({ 
                    error: "Perfil inválido",  //esse campo 'error' é o nome da chave no objeto JSON que estou enviando na resposta   
                    message: "O perfil_id fornecido não existe." 
                    });
                }

        return res.status(500).json({error: "Erro interno no servidor."});//para outros erros, retorno um erro 500 (internal server error) com uma mensagem de erro genérica
        }
    },

    getUsuarios: async (req, res) => {
       
        try {
            //faço um select no banco, ja com join pra trazer o nome do perfil
            const result = await db.query(`select u.id,
                                            u.nome as usuario_nome,
                                            u.email,
                                            u.perfil_id,
                                            p.nome as perfil
                                        from usuarios u
                                        join perfis p on p.id = u.perfil_id`)
            
            return res.status(200).json(result.rows)//trago todos os usuários com status 200 (OK)

        } catch (error) {

            console.error("Erro ao buscar os usuários:", error)
            return res.status(500).json({error: "Erro ao buscar a lista de usuários."})

        }

    },

    getUsuarioById: async (req, res) => {

        try{
            const usuarioId = req.params.id //pego o id nos parametros da requisição

            if(isNaN(usuarioId)){
                return res.status(400).json({error: "ID do usuário inválido, verifique!"})
            }

            //crio a variavel result, para armazenar a query
            const result = await db.query(`select u.id,
                                u.nome as usuario_nome,
                                u.email,
                                u.perfil_id,
                                p.nome as perfil
                            from usuarios u
                            join perfis p on p.id = u.perfil_id
                            where u.id = $1`, [usuarioId])

            if(result.rows.length === 0){
                return res.status(404).json({error: "Usuário não encontrado."})
            }               
            
            return res.status(200).json(result.rows[0])

        } catch (error) {
            
            console.error("Erro ao buscar usuário  por ID: ", error)
            return res.status(500).json({error: "Erro ao buscar usuário  por ID." })
        }

    },

    login: async (req, res) => {

        try{

            const {email, senha} = req.body;

            if(!email || !senha){
                return res.status(400).json({error: "E-mail e senha são obrigatórios."})
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Email inválido." });
            }

            const query = `select * from usuarios where email = $1`;

            const result = await db.query(query, [email]);

            if(result.rows.length === 0){
                return res.status(401).json({error: "E-mail ou senha invalidos."})
            }

            const usuario = result.rows[0];

            const senhaValida = await bcrypt.compare(senha, usuario.senha);

            if(!senhaValida){
                return res.status(401).json({error: "E-mail ou senha invalidos."})
            }

            const token = jwt.sign( //crio uma assinatura JWT usando o método sign do jsonwebtoken
            { id: usuario.id, perfil: usuario.perfil_id }, //o primeiro argumento é o payload do token, que contém os dados que quero incluir no token (id e perfil do usuário)
            //obs.: payload é o conteúdo do token, ou seja, as informações que ele carrega
            SECRET_KEY, //a segunda é a chave secreta usada para assinar o token (deve ser uma string segura e mantida em segredo)
            { expiresIn: '1h' } // O token expira em 1 hora por segurança
            );

            return res.status(200).json({message: "Login realizado com sucesso!", token: token});


        } catch(error){
            console.error("Erro no login:", error);
            return res.status(500).json({ error: "Erro interno no servidor." });
        }
    }
}

module.exports = usuarioController; //exporto o objeto usuarioController para que ele possa ser usado em outros arquivos, como nas rotas de usuário
```

### packages/backend/src/controllers/ticketController.js
```javascript
// Importao a conexão com o banco de dados em config/db.js para usar a função query
const db = require('../config/db');

/**começo criando a constante ticketController que vai agrupar todas as funções relacionadas a tickets 
 * vou chamar o ticketController de dentro das rotas (ticketRoutes.js)
 */ 
const ticketController = {
    //dentro do controler crio a função createTicket pra lidar com a criação de novos tickets
    createTicket: async (req, res) => {
    //o req e res são os objetos de requisição e resposta do Express obrigatórios em qualquer rota ou controller do Express
        try { //uso o try pra fazer o caminho feliz, ou seja, o código que eu espero que funcione sem erros

            //Extraímos os dados que o usuário enviou no body da requisição
            const { titulo, descricao, prioridade } = req.body;

            //pego o ID do solicitante das credenciais do usuário, que foram adicionadas ao req pelo middleware de autenticação (authMiddleware.js)
            const solicitante_id = req.usuarioId;

            //é "criado" uma constante para cada campo esperado no body da requisição
           
            // 2. valido se os dados obrigatórios estão presentes e válidos, se não estiverem retorno erro 400 (bad request)
            if (!titulo || !descricao || !prioridade) { //o ! inverte o valor, ou seja, verifica se está vazio ou indefinido
                return res.status(400).json({ error: "Todos os campos são obrigatórios." });
                //exemplo: se o titulo estiver vazio o js entenderia como false com o ! ele inverte para true e entra no if
            }

            if (titulo.length < 10) {//pego a propriedade length do titulo para verificar o tamanho
                return res.status(400).json({ error: "O título deve ter pelo menos 10 caracteres." });
                /**o return aqui serve para sair da função caso entre no if
                 * o res.status(400) define o código de status HTTP da resposta como 400 (bad request)
                 * o .json() envia uma resposta em formato JSON com a mensagem de erro
                 * */
            }

            const prioridadesValidas = ['P1', 'P2', 'P3']

            if (!prioridadesValidas.includes(prioridade)) {
                return res.status(400).json({ 
                error: 'Prioridade inválida. Use P1, P2 ou P3.' 
                })
            }



            /** 3. Comando SQL para inserir no banco
            * basicamente eu crio uma string com o comando SQL para inserir um novo ticket na tabela tickets
            * essa string vai ser o campo text que vou passar para a função query */
            const query = `
                INSERT INTO tickets (solicitante_id, titulo, descricao, prioridade)
                VALUES ($1, $2, $3, $4)
                RETURNING * 
            `;
            
            //crio um array com os valores que vão substituir os placeholders $1, $2, $3 e $4 na query  
            const values = [solicitante_id, titulo, descricao, prioridade];

            //chamo a função query importada do db.js passando a query e os valores
            const result = await db.query(query, values);

            // 4. Resposta de Sucesso (201 Created)
            return res.status(201).json(result.rows[0]);
            /**o res.status(201) define o código de status HTTP da resposta como 201 (Created)
            * o .json() envia uma resposta em formato JSON com os dados do ticket criado (result.rows[0])
            * é seguro utilizar o index 0 porque o RETURNING * sempre retorna um único registro
            * ou seja vou retornar para o cliente os dados do ticket que acabou de ser criado no banco de dados
            */

        } catch (error) { //caso ocorra algum erro no try, o catch vai capturar esse erro

            if (error.code === '23503') {
            // Verificamos qual constraint falhou para dar a mensagem exata
            if (error.constraint === 'tickets_solicitante_id_fkey') {
                return res.status(400).json({ error: "Usuário solicitante não encontrado." });
            }
            }

            console.error("Erro ao criar ticket:", error);//vai exibir o erro no console do servidor para ajudar na depuração
            return res.status(500).json({ error: "Erro interno no servidor." });//e pro cliente retorno um erro 500 (internal server error) 
        }
    },

    getTickets: async (req, res) => { //função para buscar todos os tickets no banco de dados
        try{
            const result = await db.query(`select t.id,
                                            t.solicitante_id,
                                            u.nome as solicitante_nome,
                                            t.analista_id,
                                            a.nome as analista_nome,
                                            t.titulo,
                                            t.descricao,
                                            t.prioridade,
                                            t.status,
                                            t.created_at
                                        from tickets t
                                        join usuarios u on u.id = t.solicitante_id
                                        left join usuarios a on a.id = t.analista_id`)
                                        
            //crio uma const result que armazena o resultado da consulta ao banco
            return res.status(200).json(result.rows) //passo o resultado para o cliente em formato JSON e status 200 (OK)
            //uso o . para acessar a propriedade rows do result que contém a lista de tickets
        } catch (error) { //caso ocorra algum erro na consulta ao banco, o catch captura esse erro
            
            console.error("Erro ao buscar tickets:", error);//uso o .error para exibir o erro no console do servidor
            return res.status(500).json({error: "Erro ao buscar a lista de tickets."})//e retorno um erro 500 pro cliente, com a mensagem de erro no formato JSON
        }
    },

    getTicketById: async (req, res) => {
        try{

            const {ticketId} = req.params; //pego o id do ticket dos parametros da requisicao

            if(isNaN(ticketId)){ //verifico se o id nao é um numero
                return  res.status(400).json({ error: "ID do ticket inválido, tem certeza que isso é um número de ticket?" });//retorno erro 400 (bad request) pro cliente
            }
            //faço a consulta ao banco para buscar o ticket com o ID especificado, a const entre colchetes é um array com os valores para os placeholders
                const result = await db.query(`select t.id,
                                                t.solicitante_id,
                                                u.nome as solicitante_nome,
                                                t.analista_id,
                                                a.nome as analista_nome,
                                                t.titulo,
                                                t.descricao,
                                                t.prioridade,
                                                t.status,
                                                t.created_at
                                            from tickets t
                                            join usuarios u on u.id = t.solicitante_id
                                            left join usuarios a on a.id = t.analista_id
                                            where t.id = $1`, [ticketId])

            //verifico se o ticket foi encontrado
            if(result.rows.length === 0){//se o length for 0 significa que nao encontrou nenhum ticket com aquele ID
                return res.status(404).json({ error: "Ticket não encontrado." });//retorno erro 404 (not found) pro cliente
            }//se não cair no if significa que encontrou o ticket, então:
            return res.status(200).json(result.rows[0]); //retorno o ticket encontrado com status 200 (OK)
        } catch (error) {
            console.error("Erro ao buscar ticket por ID:", error);
            return res.status(500).json({ error: "Erro ao buscar ticket por ID." });
        }
    },

    updateStatusTicket: async (req, res) =>{
        try{

            const {ticketId} = req.params; //pego o ID do ticket dos parametros da requisicao

            if(isNaN(ticketId)){
                return res.status(400).json({error: "ID do ticket inválido, tem certeza que isso é um número de ticket?"})
            }

             //faço a verificação se o ticket existe
            const ticketExist = await db.query('select id from tickets where id = $1', [ticketId]);

             if(ticketExist.rowCount === 0){ //o RowCount informa quantas linhas foram retornadas na consulta
                return res.status(400).json({error: "O ticket informado não existe."})
            }

            const {status} = req.body; //e o que vai ser alterado (status) eu pego do body da requisicao
            const statuspermitidos = ['Aguardando atendimento', 'Em atendimento', 'Aguardando cliente', 'Respondido', 'Tratativa Interna', 'Resolvido', 'Fechado']

            if(!statuspermitidos.includes(status)){
                return res.status(400).json({error: 'Status inválido. Escolha um dos status permitidos para o ticket. ' , Status: statuspermitidos})
            }

            //faço o update de Status
            const query = `update tickets set status = $1 where id = $2 returning *`

            const values = [status, ticketId]

            const result = await db.query(query, values)

            return res.status(200).json(result.rows[0])


        } catch (error){
            console.error("Erro ao alterar Status do ticket:", error);
            return res.status(500).json({ error: "Erro ao alterar status do ticket." });
        }
    }

};

module.exports = ticketController;
//e aqui eu exporto o ticketController para poder usar em outras partes do sistema, como nas rotas (ticketRoutes.js)
```

### packages/backend/src/controllers/notaController.js
```javascript
// Importao a conexão com o banco de dados em config/db.js para usar a função query
const db = require('../config/db')

    const notaController = {
        
        createNota: async (req, res) => {

            try{

                const autor_id = req.usuarioId; // Identidade confirmada pelo Token

                const {ticket_id, conteudo} = req.body;

                if(!ticket_id || !conteudo){ //se vem preenchido é true, mas o ! inverte a propriedade, então se não vier prenchido (false) o ! inverte pra true e entre no if
                    return res.status(400).json({error: "Valide os campos obrigatórios."})
                }

                if(conteudo.trim().length === 0){
                    return res.status(400).json({error: "O conteúdo da nota não pode estar vazio."})
                }

                if(isNaN(ticket_id)){
                    return res.status(400).json({error: "O ID do ticket deve ser numérico."})
                }

                if(conteudo.length > 5000){
                    return res.status(400).json({error: "A nota excede o limite de 5000 caracteres."})
                }

                //faço a verificação se o ticket existe e se o status dele permite adicionar notas
                const ticketExist = await db.query('select id, status from tickets where id = $1', [ticket_id]);
                
                //faço a verificação se o autor (usuário) existe
                const usuarioExist = await db.query('select id from usuarios where id = $1', [autor_id]);

                if (usuarioExist.rowCount === 0) {
                    return res.status(400).json({ error: "O autor (usuário) informado não existe." });
                }

                if(ticketExist.rowCount === 0){ //o RowCount informa quantas linhas foram retornadas na consulta
                    return res.status(400).json({error: "O ticket informado não existe."})
                }

                if(ticketExist.rows[0].status == 'Resolvido'|| ticketExist.rows[0].status === 'Fechado'){//estou usando o 403 pq o ticket existe, mas o status não permite a ação
                    return res.status(403).json({error: `Não é possível adicionar notas a um ticket com status ${ticketExist.rows[0].status}.`})
                }

                const query = `insert into notas (ticket_id, autor_id, conteudo, num_sequencial)
                                values (
                                    $1, 
                                    $2, 
                                    $3, 
                                    (select coalesce(max(num_sequencial), 0) + 1 from notas where ticket_id = $1)
                                ) returning *`

                const values = [ticket_id, autor_id, conteudo]
            
                const result = await db.query(query, values)

                return res.status(201).json(result.rows[0])

            } catch (error) {

                console.error("Erro detalhado:", error)
                return res.status(500).json({error: "Erro ao criar a nota."})
            }

        },

        getNotasByTicket: async (req, res) => {

            try{

                const {ticket_id} = req.params;

                if(isNaN(ticket_id)){
                    return res.status(400).json({error: "O ID do ticket é obrigatório e deve ser um número válido."})
                }

                const ticketExist = await db.query('select id, status from tickets where id = $1', [ticket_id]);

                if(ticketExist.rowCount === 0){ //o RowCount informa quantas linhas foram retornadas na consulta
                    return res.status(400).json({error: "O ticket informado não existe."})
                }

                const query = `SELECT
                                    n.num_sequencial,
                                    n.conteudo,
                                    n.created_at,
                                    u.nome AS autor_nome,
                                    n.autor_id
                                FROM notas n
                                JOIN usuarios u ON n.autor_id = u.id
                                WHERE n.ticket_id = $1
                                ORDER BY n.num_sequencial ASC`
                
                const result = await db.query(query, [ticket_id])
 
                return res.status(200).json(result.rows)

            } catch (error) {
                console.error("Erro ao buscar notas:", error)
                return res.status(500).json({error: "Erro interno ao buscar as notas do ticket."})
            }
        }
    }

module.exports = notaController;
```

## Copia completa - middleware e rotas

### packages/backend/src/middlewares/authMiddleware.js
```javascript
const jwt = require('jsonwebtoken'); //importo a biblioteca JWT

const SECRET_KEY = process.env.JWT_SECRET; //chamo a chave secreta do env.

//crio uma constante pra armazenar a lógica do middleware

const authMiddleware = (req, res, next) =>{

    const authHeader = req.headers['authorization'] //pego o token do cabeçalho da requisição

    //valido se não esta vazio
    if(!authHeader){
        return res.status(401).json({error: "Acesso negado. Token não fornecido."})
    }
    
    //agora vou "partir" o authHeader em 2, pra testar se ele começa com bearer
    const partes = authHeader.split(' ');

    if(partes.length !== 2 || partes[0] !== "Bearer"){
        return res.status(401).json({error: "Erro no formato do token. Use: Bearer <token>" })
    } //se tem 2 partes e uma é Bearer eu sigo

    //salvo o token numa const

    const token = partes[1];

    //agora jogo isso dentro do metodo verify do jwt, passando 3 parametros
    //basicamente, o token é verificado utilizando o SECRET_key, e se der algum erro, vai pra dentro de err, se passar é o token decodificado

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            // Se o token expirou ou a assinatura é falsa, a resposta morre aqui
            return res.status(401).json({ error: "Token inválido ou expirado." });
        }

        req.usuarioId = decoded.id; //crio essas 2 propriedades no corpo do request, pra usar posteriormente para autorização
        req.usuarioPerfil = decoded.perfil;

        //chamo o next para seguir para a próxima função no fluxo da requisição que seria o controller
        return next();
    })
}

module.exports = authMiddleware;
```

### packages/backend/src/routes/usuarioRoutes.js
```javascript
const express = require('express');//importa o express
const router = express.Router();//pego somente a funcionalidade de rotas do express
const usuarioController = require('../controllers/usuarioController');//importo o controller de usuarios
const auth = require('../middlewares/authMiddleware'); 

//vou usar o auth apenas nas rotas que precisam de autenticação, por lógica o login não precisa de autenticação, nem o createUsuario

router.post('/login', usuarioController.login) //login de usuário;
//aqui estou dizendo: "quando houver uma requisicao do tipo POST para a rota /usuarios/login chama o login do usuarioController"

router.post('/', usuarioController.createUsuario);
//aqui estou dizendo: "quando houver uma requisicao do tipo POST para a rota /usuarios chama o createUsuario do usuarioController"

router.get('/', auth, usuarioController.getUsuarios);
//aqui estou dizendo: "quando houver uma requisicao do tipo GET para a rota /usuarios chama o getUsuarios do usuarioController"

router.get('/:id', auth, usuarioController.getUsuarioById)

module.exports = router;  //aqui eu exporto o router para que ele possa ser usado em outros arquivos, como no app.js
```

### packages/backend/src/routes/ticketRoutes.js
```javascript
const express = require('express');//importa o express
const router = express.Router();//pego somente a funcionalidade de rotas do express
const ticketController = require('../controllers/ticketController');//importo o controller de tickets
const notaController = require('../controllers/notaController');//importo o controller de tickets
const auth = require('../middlewares/authMiddleware'); 

/**neste caso abaixo quando houver uma requisicao do tipo POST para a rota /tickets
 * A funcao createTicket do ticketController sera executada
 * a '/' indica que a rota ja esta associada a /tickets no app.js em app.use('/tickets', ticketRoutes);*/
router.post('/', auth, ticketController.createTicket);

router.get('/', auth, ticketController.getTickets); //aqui eu crio a rota GET /tickets que chama a funcao getTickets do ticketController

router.get('/:ticketId', auth, ticketController.getTicketById); //rota para buscar ticket por ID, o :id indica que é um parametro dinamico
/**basicamente router.post recebe dois parametros:
 * o primeiro e a rota que sera associada
 * o segundo e a funcao que sera executada quando houver uma requisicao para aquela rota
 */

router.get('/:ticket_id/notas', auth, notaController.getNotasByTicket)
//coloquei essa rota aqui pq faz mais sentido ficar junto com as rotas de tickets

router.patch('/:ticketId', auth, ticketController.updateStatusTicket) //rota para atualizar o status do ticket



module.exports = router;  //aqui eu exporto o router para que ele possa ser usado em outros arquivos, como no app.js
```

### packages/backend/src/routes/notaRoutes.js
```javascript
const express = require('express');//importa o express
const router = express.Router();//pego somente a funcionalidade de rotas do express
const notaController = require('../controllers/notaController');//importo o controller de tickets
const auth = require('../middlewares/authMiddleware'); 


/**neste caso abaixo quando houver uma requisicao do tipo POST para a rota /tickets
 * A funcao createTicket do ticketController sera executada
 * a '/' indica que a rota ja esta associada a /tickets no app.js em app.use('/tickets', ticketRoutes);*/
router.post('/', auth, notaController.createNota);


module.exports = router;  //aqui eu exporto o router para que ele possa ser usado em outros arquivos, como no app.js
```

## Copia completa - config e banco

### packages/backend/src/config/db.js
```javascript
//importo a classe pg.Pool para criar uma pool de conexões com o banco de dados PostgreSQL
const { Pool } = require('pg'); 
// Quando eu chamo o dotenv o sistema ativa o carregamento de variáveis de ambiente do arquivo .env.
// Serve para proteger dados sensíveis (senhas, portas)
require('dotenv').config();


//aqui eu instancio a pool de conexões com os dados do banco de dados vindos do arquivo .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});


//aqui eu exporto apenas a função query da pool de conexões criada acima, para evitar expor dados sensíveis e outas funcionalidades
module.exports = {
  query: (text, params) => pool.query(text, params),
/** basicamente crio uma função query que recebe o comando SQL (text) e os parâmetros (params) e chama a função query da pool de conexões criada acima 
* A pool de conexões vai substituir os placeholders pelos valores reais do array params, protegendo contra SQL Injection
* Exemplo: 'INSERT INTO tickets (titulo, prioridade) VALUES ($1, $2)' e ['Erro no Sistema', 'P1']
* O PostgreSQL se encarrega de substituir cada $N pela posição respectiva do array*/
};
```

### init.sql
```sql
-- 1. Tabela de Perfis
CREATE TABLE perfis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(20) UNIQUE NOT NULL
);

-- 2. Tabela de Usuários (com a trava no perfil_id)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    perfil_id INTEGER NOT NULL REFERENCES perfis(id) --
);

-- 3. Tabela de Tickets (com a trava no solicitante_id)
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    solicitante_id INTEGER NOT NULL REFERENCES usuarios(id), --
    analista_id    INTEGER REFERENCES usuarios(id),          -- Pode ser nulo no início
    titulo         VARCHAR(255) NOT NULL CHECK (char_length(titulo) >= 10),
    descricao      TEXT NOT NULL,
    prioridade     VARCHAR(2) NOT NULL CHECK (prioridade IN ('P1', 'P2', 'P3')),
    status         VARCHAR(30) DEFAULT 'Aguardando atendimento' 
        CHECK (status IN ('Aguardando atendimento', 'Em atendimento', 'Aguardando cliente', 'Respondido', 'Tratativa Interna', 'Resolvido', 'Fechado')),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Notas (com travas no ticket e autor)
CREATE TABLE notas (
    id SERIAL PRIMARY KEY,
    ticket_id      INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE, --
    autor_id       INTEGER NOT NULL REFERENCES usuarios(id),                  --
    conteudo       TEXT NOT NULL,
    is_internal    BOOLEAN DEFAULT FALSE,
    num_sequencial INTEGER NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- INSERÇÃO DE DADOS PADRÕES (SEEDS)
-- ==========================================================

-- Perfis base do sistema
INSERT INTO perfis (nome) VALUES ('Solicitante'), ('Analista'), ('Admin');

-- Usuários para testes iniciais
INSERT INTO usuarios (nome, email, senha, perfil_id) VALUES 
('Gustavo Solicitante', 'user@teste.com', '123456', 1),
('Smaniotto Analista', 'analista@teste.com', '123456', 2),
('Admin Sistema', 'admin@teste.com', '123456', 3);

-- Tickets iniciais para validar as listagens e JOINS
INSERT INTO tickets (solicitante_id, analista_id, titulo, descricao, prioridade, status) VALUES 
(1, NULL, 'Erro no acesso ao sistema OSS', 'Nao consigo logar na plataforma.', 'P1', 'Aguardando atendimento'),
(1, 2, 'Duvida sobre relatorio de notas', 'Como extrair as notas internas?', 'P3', 'Em atendimento');

-- Notas para validar o histórico do ticket
INSERT INTO notas (ticket_id, autor_id, conteudo, is_internal, num_sequencial) VALUES 
(2, 2, 'Iniciando investigacao.', TRUE, 1),
(2, 2, 'Use o icone de impressora.', FALSE, 2);
```

## Copia completa - infraestrutura

### docker-compose.yml
```yaml
# docker-compose.yml

services:
  db: # Nome do serviço dentro do Docker
    image: postgres:15-alpine # Versão leve do PostgreSQL baseada em Alpine Linux
    container_name: postgres_ss_tickets # Nome que aparecerá na sua lista de containers
    restart: always # Garante que o banco ligue sozinho se o Docker reiniciar
    
    # Variáveis de Ambiente: Buscam os dados do seu arquivo .env por segurança
    environment:
      POSTGRES_USER: ${DB_USER}       
      POSTGRES_PASSWORD: ${DB_PASSWORD} 
      POSTGRES_DB: ${DB_NAME}
      
    ports:
      - "5432:5432" # Mapeia a porta do computador para a porta do container
      
    volumes:
      # Copia seu script SQL para dentro do banco ao iniciar pela primeira vez
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql # Automação de tabelas
      
      # Persistência: Garante que seus tickets não sumam se o container for deletado
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata: # Declaração do volume para salvar os dados no disco físico do Windows
```

### cypress.config.js
```javascript
require('dotenv').config({ path: './packages/backend/.env' }); // Carrega as variáveis de ambiente do arquivo .env localizado na pasta backend

const { defineConfig } = require("cypress");

const db = require("./packages/backend/src/config/db");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', { //criei uma task personalizada para o Cypress para realizar uma ação no ambiente Node.js
        async resetDb() {//a ação é uma função assíncrona chamada resetDb
          //essa função vai limpar o banco de dados antes de cada teste 
          console.log("Limpando banco de dados para o teste...");
          try {
            //Dou um truncate nas tabelas que serão usadas nos testes
            // 'perfis' continua intacta (Seed Data).
            await db.query(`
              TRUNCATE TABLE 
                notas, 
                tickets, 
                usuarios 
              RESTART IDENTITY CASCADE
            `);
            return null; // O Cypress exige que retorne algo ou null
          } catch (error) {
            console.error("Erro ao limpar o banco:", error);
            throw error;
          }
        }
      });
    },
    baseUrl: "http://localhost:3000"
  },
});
```

## Copia completa - testes (Cypress)

### cypress/e2e/healthcheck.cy.js
```javascript

//Teste de Health Check da API
it('Health Check', () =>{

    cy.request({
      method: 'GET',
      url: '/health'
    }).then((response) =>{

      expect(response.status).to.equal(200)
      expect(response.body.message).to.equal('Backend e Banco de Dados conectados!')

    })
})
```

### cypress/e2e/usuarios.cy.js
```javascript
describe('Testes API- Módulo Usuários', () => {

    context('Criação de usuarios (não exige Token) - Público', () => {
        
    //payload base para criação de usuário
          const payload = {
                    nome: 'Maiza Analista A',
                    email: 'maiza1@teste7.com.br',
                    senha: '123456',
                    perfil_id: 2
            }

        beforeEach(() => {
            cy.task('resetDb')//limpo o banco antes de cada teste
        })

        

        it('Deve criar um novo usuário e validar a integridade dos dados retornados', () => {
            
            cy.createUsuario(payload).then((response) => {
                expect(response.status).to.equal(201)
                expect(response.body.id).to.be.a('number')
                expect(response.body.nome).to.equal(payload.nome)
                expect(response.body.email).to.equal(payload.email)
                expect(response.body.senha).to.be.undefined //verifico se a senha não esta sendo retornada
            })
        })

        it('Deve impedir a criação de 2 usuários com o mesmo email', () =>{

            cy.createUsuario(payload).then((response) =>{
                expect(response.status).to.equal(201)
            })

            cy.createUsuario(payload).then((response) => {
                expect(response.status).to.equal(409)
                expect(response.body.message).to.equal('Este e-mail já está cadastrado no sistema.')
            }) 
        })

        it('Deve impedir a criação de um usuario quando faltar qualquer campo obrigatório', () =>{

            const campos = ['nome', 'email', 'senha', 'perfil_id']

            campos.forEach(campo => {
                
                //crio uma cópia do payload pra mante-lo integro, e quebrar apenas a cópia durante esse teste
                const payloadIncompleto = {...payload};

                //agora pra cada execução eu deleto um campo
                delete payloadIncompleto[campo];

                //agora faço o teste que vai se repetir dentro do forEach
                cy.createUsuario(payloadIncompleto).then((response) =>{
                    expect(response.status).to.equal(400)
                    expect(response.body.error).to.equal('Todos os campos são obrigatórios.')
                    //mostro qual campo estava faltando
                    cy.log(`Validou com sucesso a ausência do campo: ${campo}`)
                })
            })
        })

        it('Deve validar cenários de dados inválidos e impedir a criação do usuario.', () => {

            const cenarios = [//crio uma matriz de cenários de teste
                { 
                    label: 'email inválido', 
                    extra: { email: 'email-sem-arroba.com' }, 
                    msg: 'Email inválido.' 
                },
                { 
                    label: 'senha curta', 
                    extra: { senha: '123' }, 
                    msg: 'A senha deve ter pelo menos 6 caracteres.' 
                },
                { 
                    label: 'perfil inexistente', 
                    extra: { perfil_id: 999 }, 
                    msg: 'Perfil inválido' 
                }
            ]

            cenarios.forEach((cenario) => {//percorro cada cenário da matriz
               
                const payloadInvalido = { ...payload, ...cenario.extra }; //crio um novo payload mesclando o payload original com os dados inválidos do cenário atual
                //no JS se houve 2 atribuições para a mesma chave, a última sobrescreve a anterior
                //nesse caso o payloadInvalido vai ter o valor original do payload, mas a chave que está em extra vai sobrescrever o valor original

                cy.createUsuario(payloadInvalido).then((response) => {
                    expect(response.status).to.equal(400);
                    expect(response.body.error).to.equal(cenario.msg);
                    cy.log(`Sucesso no cenário: ${cenario.label}`);
                })
            })
        })     
    })

    context('Listagem de usuários (exige Token) - Privado', () => {

        let token; //variável para armazenar o token de autenticação
        let usuarioId; //variável para armazenar o ID do usuário criado

        beforeEach(() => { //primeiro reseto o banco de dados   
            cy.task('resetDb')

            //crio um usuário admin para autenticar e obter o token
            const payload = {
                        nome: 'Gustavo Admin A',
                        email: 'gustavo.admin@teste.com.br',
                        senha: 'Gso@123456',
                        perfil_id: 3
            }

            cy.createUsuario(payload).then((response) => {
                expect(response.status).to.equal(201)
            }).then((response) =>{
                usuarioId = response.body.id //salvo o ID do usuário criado para usar posteriormente

                //faço o login via API para obter o token
                cy.apiLogin(payload.email, payload.senha).then((tokenRetornado) =>{
                    expect(tokenRetornado).to.be.a('string')
                    token = tokenRetornado
                })
            })
        })
        
        it('Deve listar todos os usuários do sistema com usuario logado', () => {

            cy.request({
                method: 'GET',
                url: '/usuarios',
                headers: { Authorization: `Bearer ${token}`} //incluo o token no cabeçalho da requisição
            }).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body).to.be.an('array')
                expect(response.body.length).to.be.greaterThan(0) //verifico se retornou pelo menos 1 usuário
            })
        })

        it('Deve impedir a listagem de usuários sem token de autenticação', () => {

            cy.request({
                method: 'GET',
                url: '/usuarios',
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(401)
                expect(response.body.error).to.equal('Acesso negado. Token não fornecido.')
            })
        })

        it('Deve listar um usuário específico por ID com usuario logado', () => {
            //como estou limpando o banco a cada teste, sei que o ID 1 é o admin criado no beforeEach
            cy.request({
                method: 'GET',
                url: `/usuarios/${usuarioId}`,
                headers: { Authorization: `Bearer ${token}`} //incluo o token no cabeçalho da requisição
            }).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body).to.have.property('id', usuarioId)
                expect(response.body).to.have.property('usuario_nome', 'Gustavo Admin A')
            })    
        
        })   

    })

})

```

### cypress/e2e/tickets.cy.js
```javascript
describe('Testes API- Módulo de Tickets', () => {

	let token; //variável para armazenar o token de autenticação
	let usuarioId; //variável para armazenar o ID do usuário criado
	let payloadTicket;

	beforeEach(() => { //primeiro reseto o banco de dados   
		cy.task('resetDb')

		//crio um usuário admin para autenticar e obter o token
		const payload = {
			nome: 'Gustavo Admin A',
			email: 'gustavo.admin@teste.com.br',
			senha: 'Gso@123456',
			perfil_id: 3
		}

		cy.createUsuario(payload).then((response) => {
			expect(response.status).to.equal(201)
		}).then((response) => {
			usuarioId = response.body.id //salvo o ID do usuário criado para usar posteriormente
			payloadTicket = {
				titulo: "Ticket padrão para os testes.",
				descricao: "Essa é uma descrição de um ticket padrão.",
				prioridade: "P3"
			}

			//faço o login via API para obter o token
			cy.apiLogin(payload.email, payload.senha).then((tokenRetornado) => {
				expect(tokenRetornado).to.be.a('string')
				token = tokenRetornado
			})
		})
	})

	it('Deve criar um ticket com sucesso', () => {
		cy.createTicket(payloadTicket, token).then((response) => {
			expect(response.status).to.equal(201)
			expect(response.body.titulo).to.equal('Ticket padrão para os testes.')
		})
	})

	it('Deve criar um ticket e buscar pelo ID gerado', () => {
		cy.createTicket(payloadTicket, token).then((response) => {
			expect(response.status).to.equal(201)
			expect(response.body.titulo).to.equal('Ticket padrão para os testes.')
			const idTicket = response.body.id; //salvo o id numa variavel pra usar no GET

			cy.request({
				method: 'GET',
				url: `/tickets/${idTicket}`,
				headers: { Authorization: `Bearer ${token}` }
			}).then((responseGet) => {
				expect(responseGet.status).to.equal(200)
				expect(responseGet.body.id).to.equal(idTicket)
			})
		})
	})


	it('Deve validar a ausência de cada campo obrigatório', () => {

		const campos = ['titulo', 'descricao', 'prioridade']

		campos.forEach(campo => {

			const payloadIncompleto = { ...payloadTicket }

			delete payloadIncompleto[campo]

			cy.createTicket(payloadIncompleto, token).then((response) => {
				expect(response.status).to.equal(400)
				expect(response.body.error).to.equal('Todos os campos são obrigatórios.')
				cy.log(`Validou com sucesso a ausência do campo: ${campo}`)
			})
		})
	})

	it('Deve validar cenários de dados inválidos para tickets', () => {

		const cenarios = [
			{label: 'Título curto (RN01)', extra: { titulo: 'Curto' }, msg: 'O título deve ter pelo menos 10 caracteres.'},
			{label: 'Prioridade inválida', extra: { prioridade: 'P4' }, msg: 'Prioridade inválida. Use P1, P2 ou P3.'}
		]

		cenarios.forEach((cenario) => {
			const payloadInvalido = { ...payloadTicket, ...cenario.extra };

			cy.createTicket(payloadInvalido, token).then((response) => {
				expect(response.status).to.equal(400)
				expect(response.body.error).to.equal(cenario.msg)
				cy.log(`Sucesso no cenário: ${cenario.label}`)
			})
		})
	})


	it('Deve listar todos os tickets cadastrados (Array)', () => {

		cy.request({
			method: 'GET',
			url: '/tickets',
			headers: { Authorization: `Bearer ${token}` }
		}).then((response) => {

			expect(response.status).to.equal(200);
			expect(response.body).to.be.an('array'); // Valida se o retorno é uma lista

		})
	})

	it('Deve retornar erro 404 ao buscar ticket passando uma string', () => {

		cy.request({
			method: 'GET',
			url: '/tickets/Letra',
			headers: { Authorization: `Bearer ${token}` },
			failOnStatusCode: false
		}).then((response) => {

			expect(response.status).to.equal(400)
			expect(response.body.error).to.equal('ID do ticket inválido, tem certeza que isso é um número de ticket?')
		})
	})

	it('Deve retornar erro 404 ao buscar ticket por um id invalido', () => {

		cy.request({
			method: 'GET',
			url: '/tickets/99999',
			failOnStatusCode: false,
			headers: { Authorization: `Bearer ${token}` }
		}).then((response) => {

			expect(response.status).to.equal(404)
			expect(response.body.error).to.equal('Ticket não encontrado.')
		})
	})

	it('Deve alterar o status do ticket pra um Status valido', () => {

		cy.createTicket(payloadTicket, token).then((response) => {
			expect(response.status).to.equal(201)
			expect(response.body.titulo).to.equal('Ticket padrão para os testes.')
			const ticketId = response.body.id;

			cy.request({
				method: 'PATCH',
				url: `/tickets/${ticketId}`,
				headers: { Authorization: `Bearer ${token}` },
				body: {
					status: 'Resolvido'
				}
			}).then((responsePatch) => {
				expect(responsePatch.status).to.equal(200)
				expect(responsePatch.body.id).to.equal(ticketId)
				expect(responsePatch.body.status).to.equal('Resolvido')
			})
		})
	})

	it('Deve impedir a alteração o status do ticket pra um Status invalido', () => {

		cy.createTicket(payloadTicket, token).then((response) => {
			expect(response.status).to.equal(201)
			expect(response.body.titulo).to.equal('Ticket padrão para os testes.')
			const ticketId = response.body.id;

			cy.request({
				method: 'PATCH',
				url: `/tickets/${ticketId}`,
				failOnStatusCode: false,
				headers: { Authorization: `Bearer ${token}` },
				body: {
					status: 'Invalido'
				}
			}).then((responsePatch) => {
				expect(responsePatch.status).to.equal(400)
				expect(responsePatch.body.error).to.include(`Status inválido. Escolha um dos status permitidos para o ticket.`)
			})
		})

	})

})
```

### cypress/e2e/notas.cy.js
```javascript
describe('Testes API- Módulo de Notas', () =>{

    let token; 

	beforeEach(() => { 

        cy.task('resetDb');

		//crio um usuário
		const payloadUser = {
			nome: 'Gustavo Admin A',
			email: 'gustavo.admin@teste.com.br',
			senha: 'Gso@123456',
			perfil_id: 3
		};

		cy.createUsuario(payloadUser).then((response) => {
			expect(response.status).to.equal(201)
            return response.body.id;
		}).as('usuarioId'); //armazeno como alias o id do usuario

        //faço o login
        cy.apiLogin(payloadUser.email, payloadUser.senha).then((tokenRetornado) => {
			expect(tokenRetornado).to.be.a('string')
			token = tokenRetornado
       
            const payloadTicket = {
                titulo: "Ticket padrão para os testes.",
                descricao: "Descrição padrão.",
                prioridade: "P3"
            };

            cy.createTicket(payloadTicket, token).then((response) => {
                expect(response.status).to.equal(201)
                expect(response.body.titulo).to.equal('Ticket padrão para os testes.')
                return response.body.id;
            }).as('ticketId');
        
		 });
	});

    //nessa spec vou usar o function() para ter acesso ao this
    //do contrario (usando o arrow function) não teria acesso, e teria que dar um get nos alias

    it('Deve adicionar uma nota a um ticket com sucesso', function() {
        
        //crio o payload da nota
        const payloadNota = {
            ticket_id: this.ticketId, //o this tem acesso ao alias do ticket criado no beforeEach, que fica no objeto de contexto da spec
            conteudo: "Essa é a primeira nota do ticket"
        }
        cy.createNota(payloadNota, token).then((resNota) =>{
        expect(resNota.status).to.equal(201)
        expect(resNota.body.conteudo).to.equal(payloadNota.conteudo)
       })
    
    })

    it('Valida o sequenciamento de notas do ticket A e B', function() {

        /* Pra validar o sequenciamente independente, vou criar um ticketB e adicionar 2 notas ao mesmo, e validar o num_sequencial
        * Depois vou adicionar uma nota ao ticket A, e preciso validar que o num_sequencial da nota do ticket A é 1, e o num_sequencial da primeira nota do ticket B também é 1, ou seja, o sequenciamento é independente entre os tickets
        */
        const payloadTicketB = {
            titulo: "Ticket B para sequenciamento de notas.",
            descricao: "Descrição de um ticket padrão.",
            prioridade: "P3"
        };

        cy.createTicket(payloadTicketB, token).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.titulo).to.equal(payloadTicketB.titulo);
            const ticketIdB = response.body.id;

            //crio a 1º nota pro ticket B, e valido que o num_sequencial é 1
            cy.createNota({ticket_id: ticketIdB, conteudo: "Nota 1 - Ticket B"}, token)
                .its('body.num_sequencial').should('eq', 1);
            //crio a 2º nota pro ticket B, e valido que o num_sequencial é 2
            cy.createNota({ticket_id: ticketIdB, conteudo: "Nota 2 - Ticket B"}, token)
                .its('body.num_sequencial').should('eq', 2);
            //crio a 1º nota pro ticket A, e valido que o num_sequencial é 1
            cy.createNota({ticket_id: this.ticketId, conteudo: "Nota 1 - Ticket A"}, token)
                .its('body.num_sequencial').should('eq', 1);
        })
    })

     it('Deve impedir a criação de uma nota com conteúdo vazio ou inválido', function() {
        
        const cenarios = [
            { extra: { conteudo: "   " }, erro: "O conteúdo da nota não pode estar vazio." },
            { extra: { ticket_id: "abc" }, erro: "O ID do ticket deve ser numérico." }
        ];

        cenarios.forEach(cenario => {
            const payloadInvalido = {
                ticket_id: this.ticketId,
                conteudo: "Nota Válida",
                ...cenario.extra
            };

            cy.createNota(payloadInvalido, token).then(res => {
                expect(res.status).to.equal(400);
                expect(res.body.error).to.equal(cenario.erro);
            });
        });
    });

    it('Deve retornar todas as notas de um ticket específico', function() {
        // Criamos duas notas em sequência
        cy.createNota({ ticket_id: this.ticketId, conteudo: "Nota 1" }, token);
        cy.createNota({ ticket_id: this.ticketId, conteudo: "Nota 2" }, token);

        cy.request({
            method: 'GET',
            url: `/tickets/${this.ticketId}/notas`,
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            expect(res.status).to.equal(200);
            expect(res.body).to.have.lengthOf(2);
            expect(res.body[0].num_sequencial).to.equal(1);
            expect(res.body[1].num_sequencial).to.equal(2);
        });
    });

    it('Deve impedir adição de notas a um ticket com status Resolvido (RN06)', function() {

        cy.request({
            method: 'PATCH',
            url: `/tickets/${this.ticketId}`,
            headers: { Authorization: `Bearer ${token}` },
            body: { status: 'Resolvido' }
        }).then((resPatch) => {
            expect(resPatch.status).to.equal(200); 

            const payloadNota = {
                ticket_id: this.ticketId,
                conteudo: "Tentativa de nota em ticket finalizado"
            };

            cy.createNota(payloadNota, token).then(res => {
                expect(res.status).to.equal(403); 
                expect(res.body.error).to.equal(`Não é possível adicionar notas a um ticket com status Resolvido.`)
            });
        });
    });
   
      
})

```

### cypress/support/commands.js
```javascript
//comando customizado para realizar login via API
Cypress.Commands.add('apiLogin', (email, senha) =>{
    return cy.request({
        method: 'POST',
        url: 'usuarios/login',
        body:{email, senha}
    }).then((response) =>{
        return response.body.token
    })
})

//comando customizado para criar usuário via API
Cypress.Commands.add('createUsuario', (payload) =>{
    return cy.request({
        method: 'POST',
        url: '/usuarios',
        failOnStatusCode: false,
        body: payload
    })
})

//comando pra criar ticket via API
Cypress.Commands.add('createTicket', (payload, token = null) =>{
    const headers ={}; //crio um objeto vazio para os headers

    if (token) { //se o token for fornecido, incluo no cabeçalho
        headers.Authorization = `Bearer ${token}`;
    }
    
    return  cy.request({
		method: 'POST',
		url: '/tickets',
        failOnStatusCode: false,   
		body: payload,
        headers: headers //trago o Authorization que prenchi na condicional acima
	  })
})

//comando para criar nota via API
Cypress.Commands.add('createNota', (payload, token) => {
    return cy.request({
        method: 'POST',
        url: '/notas',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false, 
        body: payload
    })
})

```

### cypress/support/e2e.js
```javascript
// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
```

## Copia completa - frontend (React/Vite)

### packages/frontend/package.json
```json
{
    "name": "frontend",
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "lint": "eslint .",
        "preview": "vite preview"
    },
    "dependencies": {
        "react": "^19.2.0",
        "react-dom": "^19.2.0"
    },
    "devDependencies": {
        "@eslint/js": "^9.39.1",
        "@types/react": "^19.2.7",
        "@types/react-dom": "^19.2.3",
        "@vitejs/plugin-react": "^5.1.1",
        "eslint": "^9.39.1",
        "eslint-plugin-react-hooks": "^7.0.1",
        "eslint-plugin-react-refresh": "^0.4.24",
        "globals": "^16.5.0",
        "vite": "^7.3.1"
    }
}
```

### packages/frontend/index.html
```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>frontend</title>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/src/main.jsx"></script>
    </body>
</html>

```

### packages/frontend/vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
})

```

### packages/frontend/eslint.config.js
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{js,jsx}'],
        extends: [
            js.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        rules: {
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
        },
    },
])

```

### packages/frontend/src/main.jsx
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

```

### packages/frontend/src/App.jsx
```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importação das páginas
import Login from './pages/Login';
import Cadastro from './pages/Cadastro.jsx'

// BALDE DE CONTEXTO: Esta função Protege as rotas.
// Ela verifica se existe um token no navegador antes de deixar o usuário entrar.
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        // Se não houver token, redireciona para o login
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Rotas Públicas: Acessíveis sem login */}
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />

                {/* Rotas Privadas: Exigem o token JWT via ProtectedRoute */}
                <Route 
                    path="/meus-chamados" 
                    element={
                        <ProtectedRoute>
                            <div>Tela de Chamados (Solicitante)</div>
                        </ProtectedRoute>
                    } 
                />
        
                <Route 
                    path="/fila-global" 
                    element={
                        <ProtectedRoute>
                            <div>Tela de Fila (Analista)</div>
                        </ProtectedRoute>
                    } 
                />

                {/* Redirecionamento padrão: Qualquer rota desconhecida vai para o Login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
```

### packages/frontend/src/pages/Login.jsx
```jsx
import React, { useState } from 'react';

const Login = () => {
    // CONTEXTO: 'useState' é como o frontend cria "caixas de memória" temporárias.
    // Quando o usuário digita, guardamos o valor nessas variáveis.
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault(); // Impede que a página recarregue ao clicar no botão

        try {
            // CONTEXTO: 'fetch' é a função nativa para fazer chamadas HTTP.
            // Estamos batendo na rota definida no seu 'usuarioRoutes.js'.
            const response = await fetch('http://localhost:3000/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }) // Transforma os dados em JSON para o backend
            });

            const data = await response.json();

            if (response.ok) {
                // CONTEXTO: Se o login for 200 (OK), guardamos o Token no navegador.
                localStorage.setItem('token', data.token);
                setMensagem("Login realizado com sucesso!");
                // Próximo passo: Redirecionar para o Dashboard
            } else {
                // CONTEXTO: Trata erros como o 401 definido no seu 'usuarioController.js'.
                setMensagem(data.error || "Erro ao realizar login");
            }
        } catch (error) {
            setMensagem("Erro de conexão com o servidor.");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>SS Tickets - Login</h2>
      
            <form onSubmit={handleSubmit}>
                <div>
                    <label>E-mail:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        data-cy="login-email" // Atributo para seus testes Cypress
                        required 
                    />
                </div>

                <div style={{ marginTop: '10px' }}>
                    <label>Senha:</label>
                    <input 
                        type="password" 
                        value={senha} 
                        onChange={(e) => setSenha(e.target.value)} 
                        data-cy="login-password"
                        required 
                    />
                </div>

                <button type="submit" style={{ marginTop: '20px' }} data-cy="login-button">
                    Entrar
                </button>
            </form>

            {mensagem && <p data-cy="login-message">{mensagem}</p>}
        </div>
    );
};

export default Login;
```

### packages/frontend/src/pages/Cadastro.jsx
```jsx
import React, { useState } from 'react';
import api from '../api/api'; // Sua instância do Axios

const Cadastro = () => {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        perfil_id: 1 // Começa como Solicitante por padrão
    });
    const [mensagem, setMensagem] = useState('');

    // Função única para atualizar qualquer campo do formulário
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCadastro = async (e) => {
        e.preventDefault();
        try {
            // Chamada para o backend via Axios
            const response = await api.post('/usuarios', formData);
      
            if (response.status === 201) {
                setMensagem("Usuário criado com sucesso! Prossiga para o Login.");
            }
        } catch (error) {
            // Captura o erro 409 (E-mail duplicado) ou 400 (Dados inválidos)
            const msgErro = error.response?.data?.message || error.response?.data?.error;
            setMensagem(msgErro || "Erro ao realizar cadastro.");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>SS Tickets - Novo Usuário</h2>
            <form onSubmit={handleCadastro}>
                <input 
                    name="nome" 
                    placeholder="Nome Completo" 
                    onChange={handleChange} 
                    required 
                    data-cy="cad-nome"
                />
                <input 
                    name="email" 
                    type="email" 
                    placeholder="E-mail" 
                    onChange={handleChange} 
                    required 
                    data-cy="cad-email"
                />
                <input 
                    name="senha" 
                    type="password" 
                    placeholder="Senha (mín. 6 caracteres)" 
                    onChange={handleChange} 
                    required 
                    data-cy="cad-senha"
                />
        
                <select name="perfil_id" onChange={handleChange} data-cy="cad-perfil">
                    <option value="1">Solicitante</option>
                    <option value="2">Analista</option>
                </select>

                <button type="submit" style={{ marginTop: '20px' }}>Criar Conta</button>
            </form>
            {mensagem && <p>{mensagem}</p>}
        </div>
    );
};

export default Cadastro;
```

### packages/frontend/src/api/api.js
```javascript
import axios from 'axios';

// Criamos uma "instância" personalizada do Axios
const api = axios.create({
    baseURL: 'http://localhost:3000', // Endereço do seu backend
});

// INTERCEPTOR: Antes de qualquer requisição sair, esta função é executada
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Pega a "chave" guardada no login
  
    if (token) {
        // Se existir um token, ele anexa no formato Bearer exigido pelo seu authMiddleware.js
        config.headers.Authorization = `Bearer ${token}`;
    }
  
    return config;
});

export default api;
```

### packages/frontend/src/App.css
```css
#root {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
}

.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}
.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
    filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@media (prefers-reduced-motion: no-preference) {
    a:nth-of-type(2) .logo {
        animation: logo-spin infinite 20s linear;
    }
}

.card {
    padding: 2em;
}

.read-the-docs {
    color: #888;
}

```

### packages/frontend/src/index.css
```css
:root {
    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;

    color-scheme: light dark;
    color: rgba(255, 255, 255, 0.87);
    background-color: #242424;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

a {
    font-weight: 500;
    color: #646cff;
    text-decoration: inherit;
}
a:hover {
    color: #535bf2;
}

body {
    margin: 0;
    display: flex;
    place-items: center;
    min-width: 320px;
    min-height: 100vh;
}

h1 {
    font-size: 3.2em;
    line-height: 1.1;
}

button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: pointer;
    transition: border-color 0.25s;
}
button:hover {
    border-color: #646cff;
}
button:focus,
button:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
    :root {
        color: #213547;
        background-color: #ffffff;
    }
    a:hover {
        color: #747bff;
    }
    button {
        background-color: #f9f9f9;
    }
}

```

## Copia completa - env e configs basicas

### .env.example
```dotenv
# Exemplo de configuração para o SS Tickets
DB_USER=seu_usuario_aqui
DB_PASSWORD=sua_senha_aqui
DB_NAME=nome_do_banco
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=chave-para-assinar-token
```
