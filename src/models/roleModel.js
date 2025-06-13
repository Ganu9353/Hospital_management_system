const db = require('../config/db');

exports.saveAdmin = (contact, user_id, callback) => {
  db.query('INSERT INTO admin (admin_contact, user_id) VALUES (?, ?)', [contact, user_id], callback);
};

exports.saveDoctor = (name, specialization, contact, experience, user_id, admin_id, callback) => {
  db.query(
    'INSERT INTO doctor (doctor_name, doctor_specialization, doctor_contact, doctor_experience, status, user_id, admin_id) VALUES (?, ?, ?, ?, "active", ?, ?)',
    [name, specialization, contact, experience, user_id, admin_id],
    callback
  );
};

exports.saveReception = (name, contact, user_id, admin_id, callback) => {
  db.query(
    'INSERT INTO reception (reception_name, reception_contact, status, user_id, admin_id) VALUES (?, ?, "active", ?, ?)',
    [name, contact, user_id, admin_id],
    callback
  );
};
