const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const roleModel = require('../models/roleModel');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;


  userModel.findUserByUsername(email, (err, existingUser) => {
    if (err) {
      return res.render("register", { message: "Server error. Try again." });
    }

    if (existingUser) {
      return res.render("register", { message: "Email already registered!" });
    }

  userModel.createUser(name, email, password, role, (err, userId) => {
    if (err) return res.status(500).send('Error creating user');

    switch (role) {
      case 'admin':
        roleModel.saveAdmin(req.body.admin_contact, userId, afterSave);
        break;
      case 'doctor':
        roleModel.saveDoctor(name, req.body.doctor_specialization, req.body.doctor_contact, req.body.doctor_experience,req.body.age,req.body.gender, userId, 1, afterSave); // hardcoded admin_id = 1
        break;
      case 'RECEPTIONIST':
        roleModel.saveReception(name, req.body.reception_contact, userId, 1, afterSave); // hardcoded admin_id = 1
        break;
      default:
        res.status(400).send('Invalid role');
    }

    function afterSave(err2) {
      if (err2) return res.status(500).send('Role-specific data insert error');
      res.redirect('/register'); // or send success message
    }
  });
});
};


exports.login = (req, res) => {
  const { email, password } = req.body;

  userModel.findUserByUsername(email, async (err, user) => {
    if (err) throw err;

    if (!user) {
      return res.render('login', { message: 'Invalid email or password.' });
    }
    
    if (!(password==user.password)) {
      return res.render('login', { message: 'Incorrect password.' });
    }

    req.session.user = { id: user.user_id, role: user.role };
    // Redirect based on role
    switch (user.role) {
      case 'ADMIN':
        return res.redirect('/Admindashboard');
      case 'DOCTOR':
        return res.redirect('/Docterdashboard');
      case 'RECEPTIONIST':
        return res.redirect('/Receptiondashboard');
      default:
        return res.render('login', { message: 'Unknown role.' });
    }
  });
};



















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
  res.render("register.ejs", { message: null });
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