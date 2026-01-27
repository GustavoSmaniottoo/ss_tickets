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