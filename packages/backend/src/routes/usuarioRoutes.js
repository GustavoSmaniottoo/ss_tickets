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