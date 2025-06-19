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

exports.getAllDoctors = (callback) => {
  const sql = `
    SELECT 
      d.doctor_id,
      d.doctor_name AS name,
      d.doctor_specialization AS specialization,
      d.doctor_contact AS contact,
      d.doctor_experience AS experience,
      d.status
    FROM doctor d
  `;
  db.query(sql, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};


exports.deleteDoctor = (doctorId, callback) => {
  // Step 1: Find user_id linked to this doctor
  const getUserIdSql = 'SELECT user_id FROM doctor WHERE doctor_id = ?';
  
  db.query(getUserIdSql, [doctorId], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(new Error('Doctor not found'));

    const userId = results[0].user_id;

    // Step 2: Delete doctor
    const deleteDoctorSql = 'DELETE FROM doctor WHERE doctor_id = ?';
    db.query(deleteDoctorSql, [doctorId], (err) => {
      if (err) return callback(err);

      // Step 3: Delete user
      const deleteUserSql = 'DELETE FROM users WHERE user_id = ?';
      db.query(deleteUserSql, [userId], (err) => {
        if (err) return callback(err);
        callback(null);
      });
    });
  });
};

exports.getDoctorById = (doctorId, callback) => {
  const sql = `
    SELECT 
      d.*, 
      u.username 
    FROM 
      doctor d 
    JOIN 
      users u 
    ON 
      d.user_id = u.user_id 
    WHERE 
      d.doctor_id = ?
  `;

  db.query(sql, [doctorId], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

exports.updateDoctor = async (data, callback) => {
  
  try {
    // 1. Update users table
    let updateUserSQL;
    const params = [data.username];

    if (data.password && data.password.trim() !== '') {
     
      updateUserSQL = `UPDATE users SET username = ?, password = ? WHERE user_id = ?`;
    } else {
      updateUserSQL = `UPDATE users SET username = ? WHERE user_id = ?`;
    }
    params.push(data.user_id);

    db.query(updateUserSQL, params);

    // 2. Update doctor table
    const updateDoctorSQL = `
      UPDATE doctor SET 
        doctor_name = ?, 
        doctor_specialization = ?, 
        doctor_contact = ?, 
        doctor_experience = ?, 
        status = ?
      WHERE doctor_id = ?
    `;
    db.query(updateDoctorSQL, [
      data.doctor_name,
      data.specialization,
      data.contact,
      data.experience,
      data.status,
      data.doctor_id
    ]);
    callback(null);
  } catch (err) {
    callback(err);
  }
};

exports.getAllReceptions = (callback) => {
  db.query(`
    SELECT 
      r.reception_id,
      r.reception_name,
      r.reception_contact,
      r.status,
      u.username,
      u.role
    FROM 
      reception r
    JOIN 
      users u ON r.user_id = u.user_id
  `, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};


// Get receptionist by ID
exports.getReceptionById = (id, callback) => {
  const sql = 'SELECT * FROM reception WHERE reception_id = ?';
  db.query(sql, [id], callback);
};

// Delete from reception
exports.deleteReceptionById = (id, callback) => {
  const sql = 'DELETE FROM reception WHERE reception_id = ?';
  db.query(sql, [id], callback);
};

// Delete user from users table
exports.deleteUserById = (userId, callback) => {
  const sql = 'DELETE FROM users WHERE user_id = ?';
  db.query(sql, [userId], callback);
};

exports.getReceptionById = (id, callback) => {
  const sql = 'SELECT * FROM reception WHERE reception_id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

exports.getReceptionById = (id, callback) => {
  const sql = `
    SELECT r.*, u.username 
    FROM reception r 
    JOIN users u ON r.user_id = u.user_id 
    WHERE r.reception_id = ?`;
  db.query(sql, [id], callback);
};

// Update reception and user data
exports.updateReception = async (data, callback) => {
  try {
    const receptionSql = `
      UPDATE reception 
      SET reception_name = ?, reception_contact = ?, status = ?
      WHERE reception_id = ?`;
    const receptionValues = [
      data.reception_name,
      data.reception_contact,
      data.status,
      data.reception_id
    ];

    // Get user_id from reception
    db.query('SELECT user_id FROM reception WHERE reception_id = ?', [data.reception_id], async (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(new Error('Reception not found'));

      const user_id = results[0].user_id;

      let userSql, userValues;

      if (data.password && data.password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        userSql = `UPDATE users SET username = ?, password = ? WHERE user_id = ?`;
        userValues = [data.username, hashedPassword, user_id];
      } else {
        userSql = `UPDATE users SET username = ? WHERE user_id = ?`;
        userValues = [data.username, user_id];
      }

      db.query(receptionSql, receptionValues, (err) => {
        if (err) return callback(err);
        db.query(userSql, userValues, callback);
      });
    });
  } catch (error) {
    callback(error);
  }
};


// -----------------reception dashboard-------------

exports.saveRoom = async ({ room_no, room_type, room_status, charges_per_day }) => {
  
  const query = `
    INSERT INTO room (room_no, room_type, room_status, charges_per_day)
    VALUES (?, ?, ?, ?)
  `;
  const result = db.execute(query, [room_no, room_type, room_status, charges_per_day]);
console.log(result);
  return result;
};

exports.getAllRooms = (callback) => {
  const query = "SELECT * FROM room";
  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

exports.saveNurse = (nurse, callback) => {
  const sql = 'INSERT INTO nurse (nurse_name, nurse_contact, nurse_shift) VALUES (?, ?, ?)';
  db.query(sql, [nurse.name, nurse.contact, nurse.shift], callback);
};

exports.getAllNurses = (callback) => {
  const sql = 'SELECT * FROM nurse';
  db.query(sql, callback);
};

exports.getRoomById = (id, callback) => {
  db.query('SELECT * FROM room WHERE room_no = ?', [id], callback);
};

exports.updateRoom = (roomData, callback) => {
  const { room_no, room_type, room_status, charges_per_day } = roomData;
  db.query(
    'UPDATE room SET room_type = ?, room_status = ?, charges_per_day = ? WHERE room_no = ?',
    [room_type, room_status, charges_per_day, room_no],
    callback
  );
};

exports.deleteRoom = (id, callback) => {
  db.query('DELETE FROM room WHERE room_no = ?', [id], callback);
};

exports.getNurseById = (id, callback) => {
  db.query('SELECT * FROM nurse WHERE nurse_id = ?', [id], callback);
};

exports.updateNurse = (nurseData, callback) => {
  const { nurse_id, nurse_name, nurse_contact, nurse_shift } = nurseData;
  db.query(
    'UPDATE nurse SET nurse_name = ?, nurse_contact = ?, nurse_shift = ? WHERE nurse_id = ?',
    [nurse_name, nurse_contact, nurse_shift, nurse_id],
    callback
  );
};

exports.deleteNurse = (id, callback) => {
  db.query('DELETE FROM nurse WHERE nurse_id = ?', [id], callback);
};

exports.addMedicine = (data, callback) => {
  const sql = 'INSERT INTO medical (patient_id, medicine_name, price_medicine) VALUES (?, ?, ?)';
  db.query(sql, [data.patient_id, data.medicine_name, data.price_medicine], callback);
};

exports.getAllMedicines = (callback) => {
  const sql = 'SELECT * FROM medical';
  db.query(sql, callback);
};


// Get available rooms
exports.getAvailableRooms = (callback) => {
  db.query("SELECT room_no FROM room WHERE room_status = 'AVAILABLE'", callback);
};

// Get available nurses (not assigned currently)
exports.getAvailableNurses = (callback) => {
  db.query(`
    SELECT nurse_id, nurse_name FROM nurse
    WHERE nurse_id NOT IN (SELECT nurse_id FROM patient WHERE status = 'ACTIVE')
  `, callback);
};

// Get all doctors
exports.getAllDoctors = (callback) => {
  db.query("SELECT doctor_id, doctor_name FROM doctor", callback);
};

// Save new patient
exports.addPatientWithUpdates = (data, callback) => {
  db.beginTransaction(err => {
    if (err) return callback(err);

    const insertPatientSql = `
      INSERT INTO patient 
        (patient_name, patient_age, patient_gender, patient_contact, patient_issue, admitted_date, room_no, nurse_id, doctor_id, status)
      VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, 'ACTIVE')`;
    const patientValues = [data.name, data.age, data.gender, data.contact, data.issue, data.room_no, data.nurse_id, data.doctor_id];

    db.query(insertPatientSql, patientValues, (err, result) => {
      if (err) return db.rollback(() => callback(err));

      // 1. Update Room status to OCCUPIED
      const updateRoomSql = `UPDATE room SET room_status = 'OCCUPIED' WHERE room_no = ?`;
      db.query(updateRoomSql, [data.room_no], (err) => {
        if (err) return db.rollback(() => callback(err));

        // 2. Optional: Prevent nurse from being reused (handled by view logic already)

        db.commit(err => {
          if (err) return db.rollback(() => callback(err));
          callback(null);
        });
      });
    });
  });
};