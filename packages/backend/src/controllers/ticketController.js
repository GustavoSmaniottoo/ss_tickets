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

            //Extraímos os dados que o usuário enviou no body da requisição
            const { titulo, descricao, prioridade } = req.body;

            //pego o ID do solicitante das credenciais do usuário, que foram adicionadas ao req pelo middleware de autenticação (authMiddleware.js)
            const solicitante_id = req.usuarioId;

            //é "criado" uma constante para cada campo esperado no body da requisição
           
            // 2. valido se os dados obrigatórios estão presentes e válidos, se não estiverem retorno erro 400 (bad request)
            if (!titulo || !descricao || !prioridade) { //o ! inverte o valor, ou seja, verifica se está vazio ou indefinido
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

            const prioridadesValidas = ['P1', 'P2', 'P3']

            if (!prioridadesValidas.includes(prioridade)) {
                return res.status(400).json({ 
                error: 'Prioridade inválida. Use P1, P2 ou P3.' 
                })
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

            if (error.code === '23503') {
            // Verificamos qual constraint falhou para dar a mensagem exata
            if (error.constraint === 'tickets_solicitante_id_fkey') {
                return res.status(400).json({ error: "Usuário solicitante não encontrado." });
            }
            }

            console.error("Erro ao criar ticket:", error);//vai exibir o erro no console do servidor para ajudar na depuração
            return res.status(500).json({ error: "Erro interno no servidor." });//e pro cliente retorno um erro 500 (internal server error) 
        }
    },

    getTickets: async (req, res) => { //função para buscar todos os tickets no banco de dados
        try{

            const { sem_analista } = req.query;
            const conditions = [];
            const params = [];

            // Solicitante só visualiza os próprios tickets (RN-ACESSO-02)
            if (req.usuarioPerfil === 1) {
                params.push(req.usuarioId);
                conditions.push(`t.solicitante_id = $${params.length}`);
            }

            if (sem_analista === 'true') {
                conditions.push('t.analista_id IS NULL');
            }

            const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

            const result = await db.query(`select t.id,
                                            t.solicitante_id,
                                            u.nome as solicitante_nome,
                                            t.analista_id,
                                            a.nome as analista_nome,
                                            t.titulo,
                                            t.descricao,
                                            t.prioridade,
                                            t.status,
                                            t.created_at
                                        from tickets t
                                        join usuarios u on u.id = t.solicitante_id
                                        left join usuarios a on a.id = t.analista_id
                                        ${whereClause}
                                        ORDER BY t.created_at ASC`, params)

            return res.status(200).json(result.rows)
        } catch (error) {

            console.error("Erro ao buscar tickets:", error);
            return res.status(500).json({error: "Erro ao buscar a lista de tickets."})
        }
    },

    getTicketById: async (req, res) => {
        try{

            const {ticketId} = req.params; //pego o id do ticket dos parametros da requisicao

            if(!Number.isInteger(Number(ticketId)) || Number(ticketId) <= 0){
                return  res.status(400).json({ error: "ID do ticket inválido, tem certeza que isso é um número de ticket?" });
            }
            //faço a consulta ao banco para buscar o ticket com o ID especificado, a const entre colchetes é um array com os valores para os placeholders
                const result = await db.query(`select t.id,
                                                t.solicitante_id,
                                                u.nome as solicitante_nome,
                                                t.analista_id,
                                                a.nome as analista_nome,
                                                t.titulo,
                                                t.descricao,
                                                t.prioridade,
                                                t.status,
                                                t.created_at
                                            from tickets t
                                            join usuarios u on u.id = t.solicitante_id
                                            left join usuarios a on a.id = t.analista_id
                                            where t.id = $1`, [ticketId])

            //verifico se o ticket foi encontrado
            if(result.rows.length === 0){//se o length for 0 significa que nao encontrou nenhum ticket com aquele ID
                return res.status(404).json({ error: "Ticket não encontrado." });//retorno erro 404 (not found) pro cliente
            }//se não cair no if significa que encontrou o ticket, então:
            return res.status(200).json(result.rows[0]); //retorno o ticket encontrado com status 200 (OK)
        } catch (error) {
            console.error("Erro ao buscar ticket por ID:", error);
            return res.status(500).json({ error: "Erro ao buscar ticket por ID." });
        }
    },

    updateStatusTicket: async (req, res) =>{
        try{

            const {ticketId} = req.params; //pego o ID do ticket dos parametros da requisicao

            if(!Number.isInteger(Number(ticketId)) || Number(ticketId) <= 0){
                return res.status(400).json({error: "ID do ticket inválido, tem certeza que isso é um número de ticket?"})
            }

            const { acao, status } = req.body;

            const ticketExist = await db.query('SELECT id, solicitante_id, analista_id, status FROM tickets WHERE id = $1', [ticketId]);
            const ticketAtual = ticketExist.rows[0];

            if (!ticketAtual) {
                return res.status(404).json({ error: "Ticket não encontrado." });
            }

            const STATUS_FINALIZADOS = ['Resolvido', 'Fechado'];
            if (STATUS_FINALIZADOS.includes(ticketAtual.status)) {
                return res.status(403).json({ error: "Ticket encerrado. Não é possível alterar tickets com status Resolvido ou Fechado." });
            }

            if (acao === 'assumir') {
                if (req.usuarioPerfil === 1) {
                    return res.status(403).json({ error: "Acesso negado. Solicitantes não podem assumir tickets." });
                }

                const novoStatus = ticketAtual.analista_id === null ? 'Em atendimento' : ticketAtual.status;

                const result = await db.query(`
                    UPDATE tickets
                    SET analista_id = $1, status = $2
                    WHERE id = $3
                    RETURNING *
                `, [req.usuarioId, novoStatus, ticketId]);

                return res.status(200).json(result.rows[0]);
            }

            if (req.usuarioPerfil === 1) {
                if (status !== 'Fechado') {
                    return res.status(403).json({ error: "Acesso negado. Você não tem permissão para alterar o ticket para esse Status." });
                }
                if (ticketAtual.solicitante_id !== req.usuarioId) {
                    return res.status(403).json({ error: "Acesso negado. Você só pode fechar seus próprios tickets." });
                }
            }

            const statuspermitidos = ['Aguardando atendimento', 'Em atendimento', 'Aguardando cliente', 'Respondido', 'Tratativa Interna', 'Resolvido', 'Fechado']

            if(!statuspermitidos.includes(status)){
                return res.status(400).json({error: 'Status inválido. Escolha um dos status permitidos para o ticket. ' , Status: statuspermitidos})
            }

            const query = `update tickets set status = $1 where id = $2 returning *`

            const values = [status, ticketId]

            const result = await db.query(query, values)

            if (!result.rows[0]) {
                return res.status(404).json({ error: "Ticket não encontrado." });
            }

            return res.status(200).json(result.rows[0])


        } catch (error){
            console.error("Erro ao alterar Status do ticket:", error);
            return res.status(500).json({ error: "Erro ao alterar status do ticket." });
        }
    }

};

module.exports = ticketController;
//e aqui eu exporto o ticketController para poder usar em outras partes do sistema, como nas rotas (ticketRoutes.js)