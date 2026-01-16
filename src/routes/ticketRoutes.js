const express = require('express');//importa o express
const router = express.Router();//pego somente a funcionalidade de rotas do express
const ticketController = require('../controllers/ticketController');//importo o controller de tickets
const notaController = require('../controllers/notaController');//importo o controller de tickets
//com isso eu consigo associar as rotas com as funcoes do controller


/**neste caso abaixo quando houver uma requisicao do tipo POST para a rota /tickets
 * A funcao createTicket do ticketController sera executada
 * a '/' indica que a rota ja esta associada a /tickets no app.js em app.use('/tickets', ticketRoutes);*/
router.post('/', ticketController.createTicket);

router.get('/', ticketController.getTickets); //aqui eu crio a rota GET /tickets que chama a funcao getTickets do ticketController

router.get('/:ticketId', ticketController.getTicketById); //rota para buscar ticket por ID, o :id indica que é um parametro dinamico
/**basicamente router.post recebe dois parametros:
 * o primeiro e a rota que sera associada
 * o segundo e a funcao que sera executada quando houver uma requisicao para aquela rota
 */

router.get('/:ticket_id/notas', notaController.getNotasByTicket)
//coloquei essa rota aqui pq faz mais sentido ficar junto com as rotas de tickets


module.exports = router;  //aqui eu exporto o router para que ele possa ser usado em outros arquivos, como no app.js