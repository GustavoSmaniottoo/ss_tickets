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