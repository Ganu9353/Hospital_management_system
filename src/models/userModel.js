const db = require("../config/db");

// Create user
exports.createUser = (name, email, hashedPassword, role) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, hashedPassword, role], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// Find user by email
exports.findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [email], callback);
};
