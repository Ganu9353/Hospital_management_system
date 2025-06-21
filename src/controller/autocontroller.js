// Updated authController.js
const bcrypt = require("bcrypt");
const pdf = require('html-pdf');
const userModel = require("../models/userModel");
const db = require('../config/db');
const { render } = require("ejs");

// Middleware to check if admin is logged in
exports.ensureAdminAuthenticated = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'ADMIN') {
    return next();
  }
  return res.status(401).send("Unauthorized: Admin not logged in.");
};

// Render login page
exports.getloginpage = (req, res) => {
  res.render("login", { message: null });
};

// Handle login
exports.login = (req, res) => {
  const { email, password } = req.body;

  userModel.findUserByUsername(email, async (err, user) => {
    if (err) {
      console.error(err);
      return res.render('login', { message: 'Internal server error' });
    }

    if (!user) {
      return res.render('login', { message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      return res.render('login', { message: 'Invalid email or password' });
    }

    // Set session
    req.session.user = {
      id: user.user_id,
      name: user.name,
      email: user.username,
      role: user.role
    };

    // Redirect based on role
    if (user.role === 'ADMIN') {
      res.redirect('/Admindashboard');
    } else if (user.role === 'DOCTOR') {
      res.redirect('/Docterdashboard');
    } else if (user.role === 'RECEPTIONIST') {
      res.redirect('/receptiondashboard');
    } else {
      res.render('login', { message: 'Invalid user role' });
    }
  });
};

// Render registration form
exports.getregisterpage = (req, res) => {
  res.render('register');
};

// Handle user registration
exports.registerUser = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'ADMIN') {
    return res.status(401).send('Unauthorized: Admin not logged in.');
  }

  const { name, email, contact, password, role, specialization, experience } = req.body;
  const adminId = req.session.user.id;

  // Check if username/email already exists
  userModel.findUserByEmail(email, (err, existingUser) => {
    if (err) return res.status(500).send('Error checking existing user.');
    if (existingUser) return res.status(400).send('Username (email) already exists.');

    // Proceed to create new user
    userModel.createUser({ name, email, contact, password, role }, (err, userId) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error creating user.');
      }

      if (role === 'doctor') {
        userModel.createDoctor({ name, contact, specialization, experience, userId, adminId }, (err) => {
          if (err) return res.status(500).send('Error creating doctor.');
          res.redirect('/Admindashboard');
        });
      } else if (role === 'receptionist') {
        userModel.createReceptionist({ name, contact, userId, adminId }, (err) => {
          if (err) return res.status(500).send('Error creating receptionist.');
          res.redirect('/Admindashboard');
        });
      } else {
        res.status(400).send('Invalid role.');
      }
    });
  });
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/login");
  });
};

exports.viewReceptionist = (req, res) => {
  userModel.getAllReceptions((err, data) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.render("viewReceptionist.ejs", { receptionist: data });
  });
};

exports.deleteReception = (req, res) => {
  const receptionId = req.query.id;

  // Step 1: Get the user_id from reception table
  userModel.getReceptionById(receptionId, (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).send("Error fetching receptionist");
    }

    const userId = result[0].user_id;

    // Step 2: Delete from reception table
    userModel.deleteReceptionById(receptionId, (err) => {
      if (err) {
        return res.status(500).send("Error deleting from reception table");
      }

      // Step 3: Delete from users table
      userModel.deleteUserById(userId, (err) => {
        if (err) {
          return res.status(500).send("Error deleting from users table");
        }

        res.redirect("/viewReception");
      });
    });
  });
};

exports.editReceptionForm = (req, res) => {
  const id = req.query.id;
  userModel.getReceptionById(id, (err, result) => {
    if (err) return res.status(500).send("Error fetching reception");
    res.render("editReception", {
      reception: result[0],
      doctor: { username: result[0].username } // You can rename 'doctor' to 'user' for clarity
    });
  });
};

// Handle update form
exports.updateReception = (req, res) => {
  const updatedData = {
    reception_id: req.body.reception_id,
    reception_name: req.body.reception_name,
    reception_contact: req.body.reception_contact,
    status: req.body.status,
    username: req.body.username,
    password: req.body.password // might be empty
  };

  userModel.updateReception(updatedData, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating reception");
    }
    res.redirect("/viewReception");
  });
};

exports.viewDoctors = (req, res) => {
  userModel.getAllDoctorss((err, doctors) => {
    if (err) return res.status(500).send('Server Error');
    res.render('viewdoctor', { doctors });
  });
};

exports.editDoctorForm = (req, res) => {
  const id = req.query.id;
  userModel.getDoctorById(id, (err, results) => {
    if (err || results.length === 0) return res.status(404).send("Doctor not found");
    res.render('editDoctor', { doctor: results[0] });
  });
};

exports.updateDoctor = (req, res) => {
  userModel.updateDoctor(req.body, (err) => {
    if (err) return res.status(500).send("Error updating doctor");
    res.redirect('/viewdoctor');
  });
};

exports.deleteDoctor = (req, res) => {
  const id = req.query.id;
  userModel.deleteDoctordatabyid(id, (err) => {
    console.log(err);
    if (err) return res.status(500).send("Error deleting doctor");
    res.redirect('/viewDoctor');
  });
};

exports.getAddPatient = (req, res) => res.render('addPatient.ejs');
exports.AddReceptionist = (req, res) => res.render('addReceptionist.ejs');
exports.getAdmindashboard = (req, res) => res.render('Admindashboard.ejs');
exports.getDocterdashboard = (req, res) => res.render('Docterdashboard.ejs');
exports.getReceptiondashboard = (req, res) => res.render('Receptiondashboard.ejs');
exports.getInsurance = (req, res) => res.render("Insurancepage.ejs");
exports.getAddDocter = (req, res) => res.render("addDoctor.ejs");
exports.getAddPatientPage = (req, res) => res.render('addpatient.ejs');
exports.getcontactpage = (req, res) => res.render("contact.ejs");
exports.getaboutpage = (req, res) => res.render("about.ejs");
exports.gethomepage = (req, res) => res.render("homepage.ejs");
exports.getAddroomPage=(req,res)=>res.render("addRoom.ejs");


// ------------------
exports.saveRoom = async (req, res) => {
  try {
    const { room_no, room_type, room_status, charges_per_day } = req.body;
    
    if (!room_no || !room_type || !room_status || !charges_per_day) {
      return res.status(400).send('All fields are required.');
    }

    await userModel.saveRoom({ room_no, room_type, room_status, charges_per_day });

    res.redirect('/room/add'); // Or render success message
  } catch (error) {
    console.error('Error saving room:', error);
    res.status(500).send('Server Error');
  }
};

exports.showRoomlist = (req, res) => {
  userModel.getAllRooms((err, rooms) => {
    
    if (err) {
      console.error("Error fetching rooms:", err);
      return res.status(500).send("Server Error");
    }
    res.render("viewRoom", { rooms });
  });
};

exports.getAddNursePage=(req,res)=>res.render("addNurse.ejs");


exports.saveNurse = (req, res) => {
  const { nurse_name, nurse_contact, nurse_shift } = req.body;
  
  const newNurse = {
    name: nurse_name,
    contact: nurse_contact,
    shift: nurse_shift
  };

  userModel.saveNurse(newNurse, (err, result) => {
    if (err) {
      console.error('Error saving nurse:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/nurse/add'); // or wherever you want to redirect
  });
};

exports.viewNurses = (req, res) => {
  userModel.getAllNurses((err, results) => {
    if (err) {
      console.error("Error fetching nurses:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render('viewnurse', { nurses: results });
  });
};

exports.addmedicine=(req,res)=>res.render("addMedicine.ejs");

// Edit form view
exports.editRoomForm = (req, res) => {
  const id = req.query.id;
  userModel.getRoomById(id, (err, result) => {
    if (err) return res.status(500).send("Error fetching room");
    res.render('editRoom', { room: result[0] });
  });
};

// Handle update
exports.updateRoom = (req, res) => {
  const roomData = req.body;
  userModel.updateRoom(roomData, (err) => {
    if (err) return res.status(500).send("Error updating room");
    res.redirect('/room/list');
  });
};

// Delete room
exports.deleteRoom = (req, res) => {
  const id = req.query.id;
  userModel.deleteRoom(id, (err) => {
    if (err) return res.status(500).send("Error deleting room");
    res.redirect('/room/list');
  });
};

exports.editNurseForm = (req, res) => {
  const id = req.query.id;
  userModel.getNurseById(id, (err, result) => {
    if (err) return res.status(500).send("Error fetching nurse data");
    res.render('editNurse', { nurse: result[0] });
  });
};

// Handle update
exports.updateNurse = (req, res) => {
  const nurseData = req.body;
  userModel.updateNurse(nurseData, (err) => {
    if (err) return res.status(500).send("Error updating nurse");
    res.redirect('/nurse/list');
  });
};

// Delete nurse
exports.deleteNurse = (req, res) => {
  const id = req.query.id;
  userModel.deleteNurse(id, (err) => {
    if (err) return res.status(500).send("Error deleting nurse");
    res.redirect('/nurse/list');
  });
};

exports.showAddForm = (req, res) => {
  res.render('addMedicine');
};





exports.getAddPatientForm = (req, res) => {
  userModel.getAvailableRoomsOnly((err, rooms) => {
    if (err) return res.status(500).send('Error loading rooms');

    userModel.getAvailableNurses((err, nurses) => {
      if (err) return res.status(500).send('Error loading nurses');

      userModel.getAllDoctors((err, doctors) => {
        if (err) return res.status(500).send('Error loading doctors');

        res.render('addPatient', { rooms, nurses, doctors });
      });
    });
  });
};

exports.savePatient = (req, res) => {
  const data = {
    name: req.body.patient_name,
    age: req.body.patient_age,
    gender: req.body.patient_gender,
    contact: req.body.patient_contact,
    issue: req.body.patient_issue,
    room_no: req.body.room_no,
    nurse_id: req.body.nurse_id,
    doctor_id: req.body.doctor_id
  };

  userModel.addPatientWithUpdates(data, (err) => {
    if (err) {
      console.error("Error adding patient with updates:", err);
      return res.status(500).send("Failed to add patient.");
    }
    res.redirect('/patient/add');
  });
};


exports.viewPatients = (req, res) => {
  userModel.getAllPatientss((err, patients) => {
    if (err) {
      console.error('Error fetching patients:', err);
      return res.status(500).send('Error loading patients');
    }
     
    res.render('viewPatient', { patients: patients });  // your EJS file
  });
};

exports.editPatientForm = (req, res) => {
  const patientId = req.query.id;

  userModel.getPatientById(patientId, (err, patientResults) => {
    if (err || patientResults.length === 0) return res.status(500).send("Patient not found.");
    
    const patient = patientResults[0];

    userModel.getAllDoctor((err, doctorResults) => {
      if (err) return res.status(500).send("Doctor fetch error");

      userModel.getAllNurse((err, nurseResults) => {
        if (err) return res.status(500).send("Nurse fetch error");

        userModel.getAvailableRooms(patientId, (err, roomResults) => {
          if (err) return res.status(500).send("Room fetch error");

          res.render('editPatient', {
            patient,
            doctors: doctorResults,
            nurses: nurseResults,
            rooms: roomResults
          });
        });
      });
    });
  });
};

exports.updatePatient = (req, res) => {
  const data = req.body;
  const patientId = data.patient_id;

  // Step 1: Get previous room number
  userModel.getPatientById(patientId, (err, result) => {
    if (err) return res.status(500).send("Error fetching old room");
    const oldRoomNo = result[0].room_no;
    const newRoomNo = data.room_no;

    // Step 2: Update patient details
    userModel.updatePatient(data, (err) => {
      if (err) return res.status(500).send("Update failed");

      // Step 3: Update room status only if changed
      if (oldRoomNo != newRoomNo) {
        // Make old room available
        userModel.updateRoomStatus(oldRoomNo, 'AVAILABLE', (err1) => {
          if (err1) console.error("Old room status update failed");

          // Make new room occupied
          userModel.updateRoomStatus(newRoomNo, 'OCCUPIED', (err2) => {
            if (err2) console.error("New room status update failed");

            res.redirect('/viewPatients');
          });
        });
      } else {
        res.redirect('/viewPatients');
      }
    });
  });
};

// --------------------------------------------------------------------------------

exports.generateBillForm = (req, res) => {
  const patientId = req.query.id;
  userModel.fetchChargesByPatientId(patientId, (err, patient) => {
    console.log(err);
    if (err) return res.status(500).send('Error fetching patient data');
    res.render('generateBill', { patient });
  });
};

exports.generateBill = (req, res) => {
  const billData = req.body;
  userModel.insertBill(billData, (err, result) => {
    if (err) return res.status(500).send('Failed to generate bill');
    res.redirect('/billing/list');
  });
};

exports.viewBills = (req, res) => {
  userModel.getAllBills((err, bills) => {
    if (err) return res.status(500).send('Error fetching bills');
    res.render('viewBills', { bills });
  });
};

exports.payBill = (req, res) => {
  const billId = req.query.id;

  // Get patient ID from bill
  const sql = 'SELECT patient_id FROM bill WHERE bill_id = ?';
  db.query(sql, [billId], (err, result) => {
    if (err || result.length === 0) return res.status(404).send('Bill not found');

    const patientId = result[0].patient_id;

    userModel.deleteBillAndPatient(billId, patientId, (err) => {
      if (err) return res.status(500).send('Error during payment and cleanup');
      res.redirect('/billing/list');
    });
  });
};

exports.downloadBill = (req, res) => {
  const billId = req.query.id;

  userModel.getBillDetails(billId, (err, bill) => {
    if (err || !bill) return res.status(404).send('Bill not found');

    // Render the EJS bill template as HTML string
    res.render('billTemplate', { bill }, (err, html) => {
      if (err) {
        console.error("EJS render error:", err);
        return res.status(500).send('Error rendering bill');
      }

      // ✅ Generate PDF from HTML using html-pdf
      pdf.create(html).toStream((err, stream) => {
        if (err) {
          console.error("PDF creation error:", err);
          return res.status(500).send('PDF generation failed');
        }

        // ✅ Set headers and stream PDF to browser
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=bill.pdf');
        stream.pipe(res);
      });
    });
  });
};

// -----------------------------
exports.viewAllPatients = (req, res) => {
  userModel.getAllPatients((err, patients) => {
    console.log(patients);
    if (err) return res.status(500).send("Error fetching patients");
    res.render('doctorPatients', { patients });
  });
};

exports.addMedicineForm = (req, res) => {
  const patientId = req.params.id;
  res.render('addMedicine', { patientId });
};

exports.saveMedicine = (req, res) => {
  const data = req.body;
  userModel.saveMedicine(data, (err) => {
    if (err) return res.status(500).send("Error saving medicine");
    res.redirect('/medicine/list/' + data.patient_id);  // Redirect to list page for that patient
  });
};

// Delete Medicine
exports.deleteMedicine = (req, res) => {
  const id = req.params.id;

  userModel.getPatientIdByMedicineId(id, (err, result) => {
    if (err) {
      console.error("Error fetching patient_id:", err);
      return res.status(500).send("Error getting patient ID");
    }

    if (result.length === 0) {
      return res.status(404).send("Medicine not found");
    }

    const patientId = result[0].patient_id;

    userModel.deleteMedicineById(id, (err2) => {
      if (err2) {
        console.error("Error deleting medicine:", err2);
        return res.status(500).send("Error deleting medicine");
      }

      res.redirect('/medicine/list/' + patientId);
    });
  });
};

// View Medicines for a patient
exports.viewMedicine = (req, res) => {
  const pid = req.params.id;
  userModel.getAllMedicines(pid, (err, results) => {
    if (err) return res.status(500).send("Error fetching medicines");
    res.render('viewMedicine', { medicines: results });
  });
};