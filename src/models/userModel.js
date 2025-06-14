const db = require('../config/db');

exports.findUserByUsername = (username, callback) => {
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(null, null);
    callback(null, results[0]);
  });
};

exports.createUser = (name, email, password, role, callback) => {
  const sql = 'INSERT INTO users (username, password, role) VALUES (?,?,?);';
  db.query(sql, [email, password, role], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId); // return inserted user_id
  });
};