const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'concert_ticket_db',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Uji koneksi awal & inisialisasi skema tabel database
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[DB] Successfully connected to MySQL database: "${process.env.DB_NAME || 'concert_ticket_db'}"`);
    connection.release();

    // Import models untuk auto-create tables
    const User = require('../models/User');
    const Ticket = require('../models/Ticket');
    const Event = require('../models/Event');
    const Transaction = require('../models/Transaction');

    await User.createTableIfNotExists();
    await Ticket.createTableIfNotExists();
    await Event.createTableIfNotExists();
    await Transaction.createTableIfNotExists();
  } catch (error) {
    console.error('[DB Error] Could not connect to MySQL database:', error.message);
    console.warn('[DB Tip] Make sure your MySQL service is running and database exists.');
  }
})();

module.exports = pool;
