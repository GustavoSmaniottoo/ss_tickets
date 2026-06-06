const db = require('../config/db');

const systemController = {
    healthCheck: async (req, res) => {
        try {
            const result = await db.query('SELECT NOW()');
            res.json({
                status: 'Online',
                message: 'Backend e Banco de Dados conectados!',
                db_time: result.rows[0].now
            });
        } catch (err) {
            res.status(500).json({ error: 'Erro ao conectar ao banco: ' + err.message });
        }
    }
};

module.exports = systemController;
