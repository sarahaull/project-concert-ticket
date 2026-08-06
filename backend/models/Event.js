const db = require('../config/db');

class Event {
  /**
   * Auto‑create `events` table.
   */
  static async createTableIfNotExists() {
    const query = `
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        event_date DATETIME NOT NULL,
        venue VARCHAR(200),
        organizer_id INT NOT NULL,
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
    try {
      await db.query(query);
      console.log('[DB Schema] Table "events" verified/created successfully.');
    } catch (error) {
      console.error('[DB Schema Error] Failed to create "events" table:', error.message);
    }
  }

  /** Create a new event (status = pending) */
  static async create({ title, description, event_date, venue, organizer_id }) {
    const [result] = await db.query(
      `INSERT INTO events (title, description, event_date, venue, organizer_id) VALUES (?,?,?,?,?)`,
      [title, description, event_date, venue, organizer_id]
    );
    return result.insertId;
  }

  static async update(id, fields) {
    const allowed = ['title', 'description', 'event_date', 'venue', 'status'];
    const setClauses = [];
    const values = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
    if (setClauses.length === 0) return null;
    const sql = `UPDATE events SET ${setClauses.join(', ')} WHERE id = ?`;
    values.push(id);
    const [result] = await db.query(sql, values);
    return result.affectedRows;
  }

  static async delete(id) {
    // Soft delete: set status to 'rejected'
    const [result] = await db.query('UPDATE events SET status = ? WHERE id = ?', ['rejected', id]);
    return result.affectedRows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /** Get public approved events, optional search term */
  static async getApproved(search = '') {
    let sql = 'SELECT * FROM events WHERE status = "approved"';
    const params = [];
    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    const [rows] = await db.query(sql, params);
    return rows;
  }

  /** Get events owned by a specific organizer */
  static async getByOrganizer(organizerId) {
    const [rows] = await db.query('SELECT * FROM events WHERE organizer_id = ?', [organizerId]);
    return rows;
  }
}

module.exports = Event;
