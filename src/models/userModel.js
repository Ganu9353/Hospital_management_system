// userModel.js
const db = require('../config/db');

exports.findUserByUsername = (username, callback) => {
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(null, null);
    callback(null, results[0]);
  });
};
exports.findUserByEmail = (email, callback) => {
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [email], (err, results) => {
    if (err) return callback(err);
    if (results.length > 0) return callback(null, results[0]); // user exists
    return callback(null, null); // user doesn't exist
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

exports.getAllDoctorss = (callback) => {
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


exports.deleteDoctordatabyid = (doctorId, callback) => {
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


exports.getAllMedicines = (pid,callback) => {
  const sql = 'SELECT * FROM medical where patient_id=?';
  db.query(sql,pid, callback);
};


// Get available rooms
exports.getAvailableRoomsOnly = (callback) => {
  const sql = `SELECT room_no FROM room WHERE room_status = 'AVAILABLE'`;
  db.query(sql, callback);
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

exports.getAllPatientss = (callback) => {
  const query = `
    SELECT 
      p.patient_id,
      p.patient_name AS name,
      p.patient_contact AS contact,
      p.patient_issue AS issue,
      p.admitted_date,
      p.discharge_date,
      p.status,
      r.room_no AS room_No,
      d.doctor_name AS doctor_name,
      n.nurse_name AS nurse
    FROM 
      patient p
    LEFT JOIN room r ON p.room_no = r.room_no
    LEFT JOIN doctor d ON p.doctor_id = d.doctor_id
    LEFT JOIN nurse n ON p.nurse_id = n.nurse_id
  `;

  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

exports.getPatientById = (id, callback) => {
  db.query('SELECT * FROM patient WHERE patient_id = ?', [id], callback);
};

exports.getAllDoctor = (callback) => {
  db.query('SELECT doctor_id, doctor_name FROM doctor', callback);
};

exports.getAllNurse = (callback) => {
  db.query('SELECT nurse_id, nurse_name FROM nurse', callback);
};

exports.getAvailableRooms = (patientId, callback) => {
  const sql = `
    SELECT room_no FROM room 
    WHERE room_status = 'Available' 
    OR room_no = (SELECT room_No FROM patient WHERE patient_id = ?)
  `;
  db.query(sql, [patientId], callback);
};

exports.updatePatient = (data, callback) => {
  const sql = `
    UPDATE patient SET
      patient_name = ?,
      patient_contact = ?,
      patient_issue = ?,
      room_no = ?,  -- ✅ fixed case
      doctor_id = ?,
      nurse_id = ?,
      admitted_date = ?,
      discharge_date = ?,  -- ✅ corrected field name
      status = ?
    WHERE patient_id = ?
  `;

  const values = [
    data.name,
    data.contact,
    data.issue,
    data.room_no,
    data.doctor_id,
    data.nurse_id,
    data.admitted_date,
    data.discharge_date,
    data.status,
    data.patient_id
  ];

  console.log("Update Patient Data:", values); // ✅ Debug
  db.query(sql, values, callback);
};

exports.updateRoomStatus = (roomNo, status, callback) => {
  const sql = `UPDATE room SET room_status = ? WHERE room_no = ?`;
  db.query(sql, [status, roomNo], callback);
};



// ----------------------------------------------------------------------------

exports.fetchChargesByPatientId = (id, callback) => {
  const sql = `
    SELECT p.*, r.charges_per_day, 
           DATEDIFF(p.discharge_date, p.admitted_date) AS total_days,
           (SELECT IFNULL(SUM(m.price_medicine), 0) 
            FROM medical m 
            WHERE m.patient_id = p.patient_id) AS medicine_charge
    FROM patient p
    LEFT JOIN room r ON p.room_no = r.room_no
    WHERE p.patient_id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);

    if (results.length > 0) {
      const data = results[0];

      // Fallback if dates are invalid
      const days = data.total_days > 0 ? data.total_days : 1;
      const room_charge = data.charges_per_day ? data.charges_per_day * days : 0;

      const patient = {
        ...data,
        total_days: days,
        room_charge
      };

      callback(null, patient);
    } else {
      callback(null, {});
    }
  });
};


exports.insertBill = (bill, callback) => {
  const sql = `
    INSERT INTO bill (patient_id, room_charges, treatment_charges, nurse_charges, medicine_charges, total_amount, billing_date)
    VALUES (?, ?, ?, ?, ?, ?, CURDATE())
  `;
  db.query(sql, [
    bill.patient_id,
    bill.room_charges,
    bill.treatment_charges,
    bill.nurse_charges,
    bill.medicine_charges,
    bill.total_amount
  ], callback);
};

exports.getAllBills = (callback) => {
  const sql = `
    SELECT b.*, p.patient_name FROM bill b
    JOIN patient p ON b.patient_id = p.patient_id
  `;
  db.query(sql, callback);
};

exports.getBillById = (billId, callback) => {
  db.query('SELECT * FROM bill WHERE bill_id = ?', [billId], (err, results) => {
    if (err || results.length === 0) return callback(err || new Error('Not found'));
    callback(null, results[0]);
  });
};

exports.deleteBillAndPatient = (billId, patientId, callback) => {
  // 1. Delete bill
  db.query('DELETE FROM bill WHERE bill_id = ?', [billId], (err, billResult) => {
    if (err) return callback(err);

    // 2. Delete treatment records (if table exists)
    
      // 3. Delete medicine records (if table exists)
      db.query('DELETE FROM medicine WHERE patient_id = ?', [patientId], (err) => {
        if (err) console.warn('No medicine table or error:', err.message); // optional

        // 4. Get room number from patient before deleting
        db.query('SELECT room_no FROM patient WHERE patient_id = ?', [patientId], (err, result) => {
          if (err) return callback(err);
          
          const roomNo = result[0]?.room_no;

          // 5. Delete patient
          db.query('DELETE FROM patient WHERE patient_id = ?', [patientId], (err) => {
            if (err) return callback(err);

            // 6. Update room status to AVAILABLE
            if (roomNo) {
              db.query('UPDATE room SET room_status = "AVAILABLE" WHERE room_no = ?', [roomNo], (err) => {
                if (err) return callback(err);
                return callback(null); // Done
              });
            } else {
              return callback(null); // No room update needed
            }
          });
        });
      });
    
  });
};


exports.getBillDetails = (billId, callback) => {
  const sql = `SELECT b.*, p.patient_name as patient_name FROM bill b
               JOIN patient p ON b.patient_id = p.patient_id
               WHERE b.bill_id = ?`;
  db.query(sql, [billId], (err, result) => {
    if (err || result.length === 0) return callback(err || new Error("Bill not found"));
    callback(null, result[0]);
  });
};

exports.getAllPatients = (callback) => {
  const sql = `
    SELECT p.patient_id AS id, p.patient_name AS name, p.patient_age AS age,
           p.patient_contact AS contact, p.patient_issue AS issue,
           p.patient_gender AS gender, p.room_no AS room,
           n.nurse_name AS nurse, p.admitted_date AS admitted,
           p.status
    FROM patient p
    LEFT JOIN nurse n ON p.nurse_id = n.nurse_id
  `;
  db.query(sql, callback);
};

exports.saveMedicine = (data, callback) => {
  const sql = 'INSERT INTO medical (patient_id, medicine_name, price_medicine) VALUES (?, ?, ?)';
  db.query(sql, [data.patient_id, data.medicine_name, data.price_medicine], callback);
};

exports.getPatientIdByMedicineId = (medicalId, callback) => {
  const sql = "SELECT patient_id FROM medical WHERE medical_id = ?";
  db.query(sql, [medicalId], callback);
};

exports.deleteMedicineById = (medicalId, callback) => {
  const sql = "DELETE FROM medical WHERE medical_id = ?";
  db.query(sql, [medicalId], callback);
};