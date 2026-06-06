// Importao a conexão com o banco de dados em config/db.js para usar a função query
const db = require('../config/db')

    const notaController = {
        
        createNota: async (req, res) => {

            try{

                const autor_id = req.usuarioId; // Identidade confirmada pelo Token

                const {ticket_id, conteudo} = req.body;

                if(!ticket_id || !conteudo){ //se vem preenchido é true, mas o ! inverte a propriedade, então se não vier prenchido (false) o ! inverte pra true e entre no if
                    return res.status(400).json({error: "Valide os campos obrigatórios."})
                }

                if(conteudo.trim().length === 0){
                    return res.status(400).json({error: "O conteúdo da nota não pode estar vazio."})
                }

                if(!Number.isInteger(Number(ticket_id)) || Number(ticket_id) <= 0){
                    return res.status(400).json({error: "O ID do ticket deve ser numérico."})
                }

                if(conteudo.length > 5000){
                    return res.status(400).json({error: "A nota excede o limite de 5000 caracteres."})
                }

                const ticketExist = await db.query('select id, status from tickets where id = $1', [ticket_id]);

                if(ticketExist.rowCount === 0){ //o RowCount informa quantas linhas foram retornadas na consulta
                    return res.status(404).json({error: "O ticket informado não existe."})
                }

                if(ticketExist.rows[0].status === 'Resolvido' || ticketExist.rows[0].status === 'Fechado'){//estou usando o 403 pq o ticket existe, mas o status não permite a ação
                    return res.status(403).json({error: `Não é possível adicionar notas a um ticket com status ${ticketExist.rows[0].status}.`})
                }

                const query = `insert into notas (ticket_id, autor_id, conteudo, num_sequencial)
                                values (
                                    $1, 
                                    $2, 
                                    $3, 
                                    (select coalesce(max(num_sequencial), 0) + 1 from notas where ticket_id = $1)
                                ) returning *`

                const values = [ticket_id, autor_id, conteudo]
            
                const result = await db.query(query, values)

                return res.status(201).json(result.rows[0])

            } catch (error) {

                console.error("Erro detalhado:", error)
                return res.status(500).json({error: "Erro ao criar a nota."})
            }

        },

        getNotasByTicket: async (req, res) => {

            try{

                const {ticket_id} = req.params;

                if(!Number.isInteger(Number(ticket_id)) || Number(ticket_id) <= 0){
                    return res.status(400).json({error: "O ID do ticket é obrigatório e deve ser um número válido."})
                }

                const ticketExist = await db.query('select id, status from tickets where id = $1', [ticket_id]);

                if(ticketExist.rowCount === 0){ //o RowCount informa quantas linhas foram retornadas na consulta
                    return res.status(404).json({error: "O ticket informado não existe."})
                }

                const query = `SELECT
                                    n.num_sequencial,
                                    n.conteudo,
                                    n.created_at,
                                    u.nome AS autor_nome,
                                    n.autor_id
                                FROM notas n
                                JOIN usuarios u ON n.autor_id = u.id
                                WHERE n.ticket_id = $1
                                ORDER BY n.num_sequencial ASC`
                
                const result = await db.query(query, [ticket_id])
 
                return res.status(200).json(result.rows)

            } catch (error) {
                console.error("Erro ao buscar notas:", error)
                return res.status(500).json({error: "Erro interno ao buscar as notas do ticket."})
            }
        }
    }

module.exports = notaController;