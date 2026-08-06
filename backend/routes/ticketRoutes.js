const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const upload = require('../middleware/uploadMiddleware');

// Routes untuk Tiket Konser
router.get('/', ticketController.getAllTickets);
router.get('/:id', ticketController.getTicketById);
router.post('/', upload.single('poster'), ticketController.createTicket);

module.exports = router;
