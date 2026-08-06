const db = require('../config/db');

class User {
  /**
   * Auto-create tabel `users` jika belum ada di database MySQL
   */
  static async createTableIfNotExists() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin', 'organizer') DEFAULT 'user',
        avatar VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    try {
      await db.query(query);
      console.log('[DB Schema] Table "users" verified/created successfully.');
    } catch (error) {
      console.error('[DB Schema Error] Failed to verify/create "users" table:', error.message);
    }
  }

  /**
   * Mencari user berdasarkan Email
   */
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  /**
   * Mencari user berdasarkan ID (tidak menyertakan password)
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Membuat user baru di database
   */
  static async create({ name, email, password, role = 'user', avatar = null }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, role, avatar]
    );
    return result.insertId;
  }
}

module.exports = User;
