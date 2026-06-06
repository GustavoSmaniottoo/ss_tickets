require('dotenv').config(); // deve ser a primeira linha — garante que process.env está populado antes de qualquer import
const express = require('express'); //Importo o framework Express da pasta node_modules
const cors = require('cors'); // Importa o middleware para permitir requisições de fora do servidor
const helmet = require('helmet'); // adiciona headers HTTP de segurança padrão (X-Content-Type-Options, HSTS, etc.)
const db = require('./config/db'); //chamo do diretorio config o arquivo db.js para utilizar a função query
const app = express();//Inicializo o Express, é como uma instância do Express de onde eu posso chamar várias funcionalidades do framework
const ticketRoutes = require('./routes/ticketRoutes'); //importo as rotas de tickets
const usuarioRoutes = require('./routes/usuarioRoutes'); //importo as rotas de usuarios
const notaRoutes = require('./routes/notaRoutes'); //importo as rotas de notas
const systemRoutes = require('./routes/systemRoutes'); //importo as rotas de sistema (health check)


app.use(helmet()); // headers de segurança HTTP padrão
// Restringe a origem aceita — usa variável de ambiente em produção, localhost:5173 em desenvolvimento
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));

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

app.use('/notas', notaRoutes);

app.use('/health', systemRoutes);

const PORT = process.env.PORT || 3000; //porta configurável via env — fallback 3000 para desenvolvimento local
const server = app.listen(PORT, () => {
/** O listen inicia o servidor na porta definida, porém ele demora alguns milissegundos pra iniciar
  * por isso a funcao de callback
  * Ela vai exibir a mensagem abaixo quando o servidor estiver rodando*/
  console.log(`Pra cima! Servidor da Smaniotto Solutions rodando em http://localhost:${PORT}`);
});

// Garante que conexões ativas são encerradas antes do processo sair (SIGTERM no deploy, SIGINT no Ctrl+C)
const encerrar = () => {
    server.close(() => {
        db.close().then(() => process.exit(0));
    });
};
process.on('SIGTERM', encerrar);
process.on('SIGINT', encerrar);