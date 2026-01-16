const express = require('express');//importa o express
const router = express.Router();//pego somente a funcionalidade de rotas do express
const notaController = require('../controllers/notaController');//importo o controller de tickets
//com isso eu consigo associar as rotas com as funcoes do controller


/**neste caso abaixo quando houver uma requisicao do tipo POST para a rota /tickets
 * A funcao createTicket do ticketController sera executada
 * a '/' indica que a rota ja esta associada a /tickets no app.js em app.use('/tickets', ticketRoutes);*/
router.post('/', notaController.createNota);


module.exports = router;  //aqui eu exporto o router para que ele possa ser usado em outros arquivos, como no app.js