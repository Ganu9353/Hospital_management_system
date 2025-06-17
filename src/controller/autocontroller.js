// authController.js
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const db = require('../config/db');

// Render login page
exports.getloginpage = (req, res) => {
  res.render("login");
};

// Handle login
exports.login = (req, res) => {
  const { email, password } = req.body;

  userModel.findUserByUsername(email, async (err, user) => {
    console.log(user);
    if (err) {
      console.error(err);
      return res.render('login', { message: 'Internal server error' });
    }

    if (!user) {
      return res.render('login', { message: 'User not found' });
    }
    console.log(user.role);
    const match = await bcrypt.compare(password, user.password);
    console.log(match);
    if (match) {
      return res.render('login', { message: 'Invalid email or password' });
    }

    // Set session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Redirect based on role
    if (user.role === 'ADMIN') {
      res.redirect('/Admindashboard');
    } else if (user.role === 'DOCTOR') {
      res.redirect('/doctordashboard');
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
  // Ensure the user is logged in and is an admin
  if (!req.session.user || !req.session.user.id || req.session.user.role !== 'ADMIN') {
    return res.status(401).send('Unauthorized: Admin not logged in.');
  }

  const { name, email, contact, password, role, specialization, experience } = req.body;
  const adminId = req.session.user.id;

  // Save user
  userModel.createUser({ name, email, contact, password, role }, (err, userId) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error creating user.');
    }

    if (role === 'doctor') {
      userModel.createDoctor({ name, contact, specialization, experience, userId, adminId }, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error creating doctor.');
        }
        res.redirect('/Admindashboard');
      });
    } else if (role === 'receptionist') {
      userModel.createReceptionist({ name, contact, userId, adminId }, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error creating receptionist.');
        }
        res.redirect('/Admindashboard');
      });
    } else {
      res.status(400).send('Invalid role.');
    }
  });
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/login");
  });
};

function commitTransaction(conn, userId, callback) {
  conn.commit(err => {
    if (err) {
      return conn.rollback(() => {
        conn.release();
        return callback(err);
      });
    }

    conn.release();
    return callback(null, userId);
  });
}














exports.viewReceptionist=(req,res)=>{
  userModel.getAllReceptions((err, data) => {
    if (err) {
      console.error("Error fetching reception data:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("viewReceptionist.ejs", { receptionist: data });
  });
};
exports.deleteReception = (req, res) => {
  const id = req.query.id;
  userModel.deleteReceptionById(id, (err, result) => {
    if (err) {
      return res.status(500).send("Error deleting reception");
    }
    res.redirect("/viewReception");
  });
};


exports.editReceptionForm = (req, res) => {
  const id = req.query.id;
  userModel.getReceptionById(id, (err, result) => {
    if (err) return res.status(500).send("Error fetching reception");
    res.render("editReception", { reception: result[0] });
  });
};

// Handle form submission
exports.updateReception = (req, res) => {
  const updatedData = {
    reception_id: req.body.reception_id,
    reception_name: req.body.reception_name,
    reception_contact: req.body.reception_contact,
    status: req.body.status,
  };

  userModel.updateReception(updatedData, (err, result) => {
    if (err) return res.status(500).send("Error updating reception");
    res.redirect("/viewReception");
  });
};

exports.viewDoctors = (req, res) => {
  userModel.getAllDoctors((err, doctors) => {
    if (err) {
      console.error('Error fetching doctors:', err);
      return res.status(500).send('Server Error');
    }
    console.log(doctors);
    
    res.render('viewdoctor', { doctors });
  });
};

// Load edit form
exports.editDoctorForm = (req, res) => {
  const id = req.query.id;
  userModel.getDoctorById(id, (err, results) => {
    if (err || results.length === 0) return res.status(404).send("Doctor not found");
    res.render('editDoctor', { doctor: results[0] });
  });
};
// Delete doctor
exports.deleteDoctor = (req, res) => {
  const id = req.query.id;
  userModel.deleteDoctor(id, (err) => {
    if (err) return res.status(500).send("Error deleting doctor");
    res.redirect('/viewDoctors');
  });
};

// Update doctor
exports.updateDoctor = (req, res) => {
  userModelModel.updateDoctor(req.body, (err) => {
    if (err) return res.status(500).send("Error updating doctor");
    res.redirect('/doctors/view');
  });
};

exports.getAddPatient=(req,res)=>{
  res.render('addPatient.ejs');
};

exports.AddReceptionist=(req,res)=>{
  res.render('addReceptionist.ejs');
};

exports.getAdmindashboard=(req,res)=>{
  res.render('Admindashboard.ejs');
};
exports.getDocterdashboard=(req,res)=>{
  res.render('Docterdashboard.ejs');
};
exports.getReceptiondashboard=(req,res)=>{
  res.render('Receptiondashboard.ejs');
};
exports.getInsurance=(req,res)=>{
  res.render("Insurancepage.ejs");
};
exports.getAddDocter=(req,res)=>{
  res.render("addDoctor.ejs");
};

exports.logout=(req,res)=>{
  res.render("homepage.ejs");
};
exports.getAddPatientPage=(req,res)=>{
  res.render('patient.ejs');
};
exports.getcontactpage=(req,res)=>{
  res.render("contact.ejs");
};

exports.getregisterpage=(req,res)=>{
  console.log("register");
  res.render("register.ejs");
  
};
exports.gethomepage=(req,res)=>{
  res.render("homepage.ejs");
};
exports.getloginpage=(req,res)=>{
   res.render('login.ejs', { message: null });
};
exports.getaboutpage=(req,res)=>{
  res.render("about.ejs");
};