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

exports.getAllReceptions = (callback) => {
  const sql = `
    SELECT r.reception_id AS id, r.reception_name AS name, 
           r.reception_contact AS contact, r.status
    FROM reception r
  `;
  db.query(sql, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

exports.deleteReceptionById = (id, callback) => {
  const sql = "DELETE FROM reception WHERE reception_id = ?";
  db.query(sql, [id], callback);
};


// Get single reception by ID
exports.getReceptionById = (id, callback) => {
  const sql = "SELECT * FROM reception WHERE reception_id = ?";
  db.query(sql, [id], callback);
};

// Update reception
exports.updateReception = (data, callback) => {
  const sql = `
    UPDATE reception 
    SET reception_name = ?, reception_contact = ?, status = ? 
    WHERE reception_id = ?`;
    
  db.query(sql, [data.reception_name, data.reception_contact, data.status, data.reception_id], callback);
};

exports.getAllDoctors = (callback) => {
  const sql = `
    SELECT 
      doctor.doctor_id AS id,
      doctor.doctor_name AS name,
      doctor.doctor_specialization AS specialization,
      doctor.doctor_contact AS contact,
      doctor.doctor_experience AS experience,
      doctor.status AS status
    FROM doctor
    JOIN users ON doctor.user_id = users.user_id
    WHERE users.role = 'DOCTOR'
  `;

  db.query(sql, (err, result) => {
    callback(err, result);
  });
};

// Get a single doctor by ID
exports.getDoctorById = (id, callback) => {
  db.query('SELECT * FROM doctor WHERE doctor_id = ?', [id], callback);
};

// Delete a doctor
exports.deleteDoctor = (id, callback) => {
  db.query('DELETE FROM doctor WHERE doctor_id = ?', [id], callback);
};


// Update doctor
exports.updateDoctor = (data, callback) => {
  const { doctor_name, doctor_specialization, doctor_contact, doctor_experience, status, doctor_id } = data;
  const sql = `UPDATE doctor SET doctor_name=?, doctor_specialization=?, doctor_contact=?, doctor_experience=?, status=? WHERE doctor_id=?`;
  db.query(sql, [doctor_name, doctor_specialization, doctor_contact, doctor_experience, status, doctor_id], callback);
};