const db = require('../config/db');

class Ticket {
  /**
   * Auto-create tabel `tickets` jika belum ada di database MySQL & seed data awal
   */
  static async createTableIfNotExists() {
    const query = `
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        artist VARCHAR(150) NOT NULL,
        venue VARCHAR(150) NOT NULL,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(50) DEFAULT '19:00 WIB',
        price DECIMAL(12, 2) NOT NULL,
        formatted_price VARCHAR(100) DEFAULT NULL,
        quota INT NOT NULL DEFAULT 100,
        available INT NOT NULL DEFAULT 100,
        poster VARCHAR(255) DEFAULT NULL,
        category VARCHAR(50) DEFAULT 'Pop',
        rating DECIMAL(2, 1) DEFAULT 4.8,
        featured TINYINT(1) DEFAULT 0,
        tag VARCHAR(50) DEFAULT '🔥 Popular',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    try {
      await db.query(query);
      console.log('[DB Schema] Table "tickets" verified/created successfully.');
      await Ticket.seedInitialData();
    } catch (error) {
      console.error('[DB Schema Error] Failed to verify/create "tickets" table:', error.message);
    }
  }

  /**
   * Mengisi data sampel tiket jika tabel tickets masih kosong
   */
  static async seedInitialData() {
    try {
      const [rows] = await db.query('SELECT COUNT(*) as count FROM tickets');
      if (rows[0].count === 0) {
        const sampleTickets = [
          [
            'Konser Rock Festival 2026',
            'GIGI, Sheila on 7, Padi',
            'Stadion Utama GBK, Jakarta',
            '15 November 2026',
            '19:00 - 23:00 WIB',
            350000.00,
            'Rp 350.000 - Rp 1.200.000',
            300,
            250,
            'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop&crop=center',
            'Rock',
            4.8,
            1,
            '🔥 Terlaris'
          ],
          [
            'Jazz Night Under The Stars',
            'KLA Project, Tulus, Maliq & D\'Essentials',
            'Taman Ismail Marzuki, Jakarta',
            '28 November 2026',
            '18:30 - 22:30 WIB',
            250000.00,
            'Rp 250.000 - Rp 850.000',
            200,
            180,
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center',
            'Jazz',
            4.9,
            0,
            '🎷 Eksklusif'
          ],
          [
            'K-Pop Super Concert 2026',
            'BTS, BLACKPINK, TWICE, Stray Kids',
            'Indonesia Convention Exhibition (ICE) BSD',
            '08 Desember 2026',
            '17:00 - 22:00 WIB',
            1500000.00,
            'Rp 1.500.000 - Rp 4.500.000',
            500,
            420,
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
            'K-Pop',
            5.0,
            1,
            '⭐ Special Event'
          ]
        ];

        const insertQuery = `
          INSERT INTO tickets 
          (title, artist, venue, date, time, price, formatted_price, quota, available, poster, category, rating, featured, tag) 
          VALUES ?
        `;
        await db.query(insertQuery, [sampleTickets]);
        console.log('[DB Seed] Seeded initial concert tickets successfully.');
      }
    } catch (error) {
      console.error('[DB Seed Error] Failed to seed initial tickets:', error.message);
    }
  }

  /**
   * Mengambil seluruh data tiket konser
   */
  static async getAllActive() {
    const [rows] = await db.query('SELECT * FROM tickets ORDER BY id ASC');
    return rows;
  }

  /**
   * Mengambil tiket berdasarkan ID
   */
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM tickets WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /**
   * Membuat tiket konser baru
   */
  static async create(ticketData) {
    const {
      title,
      artist,
      venue,
      date,
      time,
      price,
      formatted_price,
      quota,
      poster,
      category,
      tag,
    } = ticketData;

    const [result] = await db.query(
      `INSERT INTO tickets 
      (title, artist, venue, date, time, price, formatted_price, quota, available, poster, category, tag) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        artist,
        venue,
        date,
        time || '19:00 WIB',
        price,
        formatted_price || `Rp ${Number(price).toLocaleString('id-ID')}`,
        quota || 100,
        quota || 100,
        poster,
        category || 'Pop',
        tag || '🔥 Baru',
      ]
    );
    return result.insertId;
  }
}

module.exports = Ticket;
