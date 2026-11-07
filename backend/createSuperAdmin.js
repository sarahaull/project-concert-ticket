const bcrypt = require("bcrypt");
const db = require("./config/db");

const createSuperAdmin = async () => {
  try {
    const fullname = "Super Admin";
    const username = "superadmin";
    const email = "superadmin@gmail.com";
    const password = "SuperAdmin123";

    // Cek apakah sudah ada
    const [existing] = await db.query(
      "SELECT id, email, role FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      console.log("Akun sudah ada:");
      console.log(existing[0]);

      // Kalau sudah ada, ubah role menjadi super_admin
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.query(
        `UPDATE users
         SET fullname = ?,
             username = ?,
             password = ?,
             role = ?
         WHERE email = ?`,
        [
          fullname,
          username,
          hashedPassword,
          "super_admin",
          email,
        ]
      );

      console.log("Akun berhasil diperbarui menjadi Super Admin.");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.query(
        `INSERT INTO users
          (fullname, username, email, password, role)
         VALUES (?, ?, ?, ?, ?)`,
        [
          fullname,
          username,
          email,
          hashedPassword,
          "super_admin",
        ]
      );

      console.log("Akun Super Admin berhasil dibuat.");
    }

    console.log("");
    console.log("================================");
    console.log("SUPER ADMIN");
    console.log("================================");
    console.log("Email    :", email);
    console.log("Password :", password);
    console.log("Role     : super_admin");
    console.log("================================");

    process.exit(0);
  } catch (error) {
    console.error("Gagal membuat Super Admin:", error);
    process.exit(1);
  }
};

createSuperAdmin();