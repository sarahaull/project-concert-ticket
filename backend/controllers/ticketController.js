const Ticket = require('../models/Ticket');

/**
 * Ticket Controller - Manajemen Tiket Konser dengan Database MySQL
 */

// GET /api/tickets - Ambil seluruh tiket konser aktif
const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.getAllActive();
    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tickets/:id - Ambil detail tiket berdasarkan ID
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Tiket dengan ID ${id} tidak ditemukan.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/tickets - Buat tiket konser baru (dengan file poster upload)
const createTicket = async (req, res, next) => {
  try {
    const { title, artist, venue, date, time, price, quota, category, tag } = req.body;
    let posterUrl = null;

    if (req.file) {
      posterUrl = `/uploads/${req.file.filename}`;
    }

    if (!title || !price) {
      return res.status(400).json({
        success: false,
        message: 'Judul dan harga tiket wajib diisi.',
      });
    }

    const ticketId = await Ticket.create({
      title,
      artist,
      venue,
      date,
      time,
      price,
      quota,
      poster: posterUrl,
      category,
      tag,
    });

    const newTicket = await Ticket.findById(ticketId);

    return res.status(201).json({
      success: true,
      message: 'Tiket konser berhasil ditambahkan!',
      data: newTicket,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  createTicket,
};
