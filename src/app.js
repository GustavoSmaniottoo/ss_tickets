const express = require('express'); //Importo o framework Express da pasta node_modules
const db = require('./config/db'); //chamo do diretorio config o arquivo db.js para utilizar a função query
const app = express();//Inicializo o Express, é como uma instância do Express de onde eu posso chamar várias funcionalidades do framework
const ticketRoutes = require('./routes/ticketRoutes'); //importo as rotas de tickets

/** Basicamente criamos um middleware global, onde o express vai automaticamente interpretar qualquer requisição como JSON
  * o app é a instância do Express criada acima
  * o .use() serve para configurar middlewares no Express
  * o express.json() é um middleware que faz magica de pegar o corpo da requisição e transformar em um objeto JavaScript acessível via req.body*/
app.use(express.json());

app.use('/tickets', ticketRoutes); /**o app.use() pede dois parâmetros: 
* a rota base e o roteador (router) que vai lidar com as requisições para essa rota
* no caso o ticketRoutes que foi importado acima*/

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