const express = require('express');//importa o express
const router = express.Router();//pego somente a funcionalidade de rotas do express
const usuarioController = require('../controllers/usuarioController');//importo o controller de usuarios


router.post('/', usuarioController.createUsuario);
//aqui estou dizendo: "quando houver uma requisicao do tipo POST para a rota /usuarios chama o createUsuario do usuarioController"

module.exports = router;  //aqui eu exporto o router para que ele possa ser usado em outros arquivos, como no app.js