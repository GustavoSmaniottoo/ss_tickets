const express = require('express');//importa o express
const router = express.Router();//pego somente a funcionalidade de rotas do express
const usuarioController = require('../controllers/usuarioController');//importo o controller de usuarios
const auth = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

//vou usar o auth apenas nas rotas que precisam de autenticação, por lógica o login não precisa de autenticação, nem o createUsuario

// Limite de 10 tentativas por IP a cada 15 minutos — protege contra força bruta na rota de login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', loginLimiter, usuarioController.login) //login de usuário;
//aqui estou dizendo: "quando houver uma requisicao do tipo POST para a rota /usuarios/login chama o login do usuarioController"

router.post('/', usuarioController.createUsuario);
//aqui estou dizendo: "quando houver uma requisicao do tipo POST para a rota /usuarios chama o createUsuario do usuarioController"

router.get('/', auth, usuarioController.getUsuarios);
//aqui estou dizendo: "quando houver uma requisicao do tipo GET para a rota /usuarios chama o getUsuarios do usuarioController"

router.get('/:id', auth, usuarioController.getUsuarioById)

module.exports = router;  //aqui eu exporto o router para que ele possa ser usado em outros arquivos, como no app.js