const db = require('../config/db');

class Transaction {
  /** Auto‑create `transactions` table */
  static async createTableIfNotExists() {
    const query = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        event_id INT NOT NULL,
        ticket_category VARCHAR(100),
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        total_amount DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
    try {
      await db.query(query);
      console.log('[DB Schema] Table "transactions" verified/created successfully.');
    } catch (error) {
      console.error('[DB Schema Error] Failed to create "transactions" table:', error.message);
    }
  }

  static async create({ user_id, event_id, ticket_category, price, quantity }) {
    const total_amount = price * quantity;
    const [result] = await db.query(
      `INSERT INTO transactions (user_id, event_id, ticket_category, price, quantity, total_amount) VALUES (?,?,?,?,?,?)`,
      [user_id, event_id, ticket_category, price, quantity, total_amount]
    );
    return result.insertId;
  }

  /** Aggregate stats for a given organizer */
  static async statsByOrganizer(organizerId) {
    const sql = `
      SELECT COUNT(t.id) AS ticketsSold, SUM(t.total_amount) AS revenue
      FROM transactions t
      JOIN events e ON t.event_id = e.id
      WHERE e.organizer_id = ?`;
    const [rows] = await db.query(sql, [organizerId]);
    return rows[0] || { ticketsSold: 0, revenue: 0 };
  }

  /** Global platform stats */
  static async globalStats() {
    const [users] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [organizers] = await db.query('SELECT COUNT(*) AS totalOrganizers FROM users WHERE role = "organizer"');
    const [events] = await db.query('SELECT COUNT(*) AS totalEvents FROM events WHERE status = "approved"');
    const [transactions] = await db.query('SELECT COUNT(*) AS totalTransactions, SUM(total_amount) AS totalRevenue FROM transactions');
    return {
      totalUsers: users[0].totalUsers,
      totalOrganizers: organizers[0].totalOrganizers,
      totalEvents: events[0].totalEvents,
      totalTransactions: transactions[0].totalTransactions,
      totalRevenue: transactions[0].totalRevenue || 0,
    };
  }
}

module.exports = Transaction;
