// Importao a conexão com o banco de dados em config/db.js para usar a função query
const db = require('../config/db')

    const notaController = {
        
        createNota: async (req, res) => {

            try{

                const {ticket_id, autor_id, conteudo} = req.body

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

            } catch {

            }

        }

    
    }


module.exports = notaController;