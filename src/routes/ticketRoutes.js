const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// Definimos a rota de criação de tickets
// POST http://localhost:3000/tickets
router.post('/tickets', ticketController.createTicket);

module.exports = router;