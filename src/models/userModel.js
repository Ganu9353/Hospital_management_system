const db = require('../config/db');

exports.createUser = (name, email, hashedPassword, role, callback) => {
  const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, email, hashedPassword, role], callback);
};

exports.findUserByEmail = (email, callback) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], callback);
};
