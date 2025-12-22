const express = require('express');
const db = require('./config/db'); // Importa a conexão que você criou
const app = express();

// Middleware: Diz ao Express para entender dados enviados em formato JSON
app.use(express.json());

// Rota de Teste: Vamos validar se o Express consegue falar com o Postgres
app.get('/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()'); // Pergunta a hora atual ao banco
    res.json({
      status: 'Online',
      message: 'Backend e Banco de Dados conectados!',
      db_time: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao conectar ao banco: ' + err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor da Smaniotto Solutions rodando em http://localhost:${PORT}`);
});