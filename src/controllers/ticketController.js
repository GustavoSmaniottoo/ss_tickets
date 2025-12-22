// Importamos a conexão com o banco de dados que já criamos em config/db.js
const db = require('../config/db');

const ticketController = {
    // Função para criar um novo ticket
    createTicket: async (req, res) => {
        try {
            // 1. Extraímos os dados que o usuário enviou no corpo (body) da requisição
            const { solicitante_id, titulo, descricao, prioridade } = req.body;

            // 2. Validação simples (A visão de QA atuando aqui!)
            if (!solicitante_id || !titulo || !descricao || !prioridade) {
                return res.status(400).json({ error: "Todos os campos são obrigatórios." });
            }

            if (titulo.length < 10) {
                return res.status(400).json({ error: "O título deve ter pelo menos 10 caracteres." });
            }

            // 3. Comando SQL para inserir no banco (A parte do "Model")
            const query = `
                INSERT INTO tickets (solicitante_id, titulo, descricao, prioridade)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            
            const values = [solicitante_id, titulo, descricao, prioridade];
            const result = await db.query(query, values);

            // 4. Resposta de Sucesso (201 Created)
            return res.status(201).json(result.rows[0]);

        } catch (error) {
            console.error("Erro ao criar ticket:", error);
            return res.status(500).json({ error: "Erro interno no servidor." });
        }
    }
};

module.exports = ticketController;