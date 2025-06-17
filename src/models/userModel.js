// userModel.js
const db = require('../config/db');

exports.findUserByUsername = (username, callback) => {
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(null, null);
    callback(null, results[0]);
  });
};

exports.createUser = (userData, callback) => {
  const { name, email, contact, password, role } = userData;
  const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
  db.query(sql, [email, password, role.toUpperCase()], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
};

exports.createDoctor = (data, callback) => {
  const sql = `INSERT INTO doctor (doctor_name, doctor_contact, doctor_specialization, doctor_experience, user_id, admin_id, status) VALUES (?, ?, ?, ?, ?, ?, 'active')`;
  db.query(sql, [data.name, data.contact, data.specialization, data.experience, data.userId, data.adminId], callback);
};

exports.createReceptionist = (data, callback) => {
  const sql = `INSERT INTO reception (reception_name, reception_contact, user_id, admin_id, status) VALUES (?, ?, ?, ?, 'active')`;
  db.query(sql, [data.name, data.contact, data.userId, data.adminId], callback);
};
