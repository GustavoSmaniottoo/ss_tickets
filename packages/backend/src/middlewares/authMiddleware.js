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

