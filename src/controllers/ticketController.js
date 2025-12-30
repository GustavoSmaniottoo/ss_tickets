// Importao a conexão com o banco de dados em config/db.js para usar a função query
const db = require('../config/db');

/**começo criando a constante ticketController que vai agrupar todas as funções relacionadas a tickets 
 * vou chamar o ticketController de dentro das rotas (ticketRoutes.js)
 */ 
const ticketController = {
    //dentro do controler crio a função createTicket pra lidar com a criação de novos tickets
    createTicket: async (req, res) => {
    //o req e res são os objetos de requisição e resposta do Express obrigatórios em qualquer rota ou controller do Express
        try { //uso o try pra fazer o caminho feliz, ou seja, o código que eu espero que funcione sem erros

            // 1. Extraímos os dados que o usuário enviou no body da requisição
            const { solicitante_id, titulo, descricao, prioridade } = req.body;
            //é "criado" uma constante para cada campo esperado no body da requisição
           
            // 2. valido se os dados obrigatórios estão presentes e válidos, se não estiverem retorno erro 400 (bad request)
            if (!solicitante_id || !titulo || !descricao || !prioridade) { //o ! inverte o valor, ou seja, verifica se está vazio ou indefinido
                return res.status(400).json({ error: "Todos os campos são obrigatórios." });
                //exemplo: se o titulo estiver vazio o js entenderia como false com o ! ele inverte para true e entra no if
            }

            if (titulo.length < 10) {//pego a propriedade length do titulo para verificar o tamanho
                return res.status(400).json({ error: "O título deve ter pelo menos 10 caracteres." });
                /**o return aqui serve para sair da função caso entre no if
                 * o res.status(400) define o código de status HTTP da resposta como 400 (bad request)
                 * o .json() envia uma resposta em formato JSON com a mensagem de erro
                 * */
            }

            /** 3. Comando SQL para inserir no banco
            * basicamente eu crio uma string com o comando SQL para inserir um novo ticket na tabela tickets
            * essa string vai ser o campo text que vou passar para a função query */
            const query = `
                INSERT INTO tickets (solicitante_id, titulo, descricao, prioridade)
                VALUES ($1, $2, $3, $4)
                RETURNING * 
            `;
            
            //crio um array com os valores que vão substituir os placeholders $1, $2, $3 e $4 na query  
            const values = [solicitante_id, titulo, descricao, prioridade];

            //chamo a função query importada do db.js passando a query e os valores
            const result = await db.query(query, values);

            // 4. Resposta de Sucesso (201 Created)
            return res.status(201).json(result.rows[0]);
            /**o res.status(201) define o código de status HTTP da resposta como 201 (Created)
            * o .json() envia uma resposta em formato JSON com os dados do ticket criado (result.rows[0])
            * é seguro utilizar o index 0 porque o RETURNING * sempre retorna um único registro
            * ou seja vou retornar para o cliente os dados do ticket que acabou de ser criado no banco de dados
            */

        } catch (error) { //caso ocorra algum erro no try, o catch vai capturar esse erro
            console.error("Erro ao criar ticket:", error);//vai exibir o erro no console do servidor para ajudar na depuração
            return res.status(500).json({ error: "Erro interno no servidor." });//e pro cliente retorno um erro 500 (internal server error) 
        }
    }
};

module.exports = ticketController;
//e aqui eu exporto o ticketController para poder usar em outras partes do sistema, como nas rotas (ticketRoutes.js)