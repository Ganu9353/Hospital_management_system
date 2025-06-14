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
        roleModel.saveDoctor(name, req.body.doctor_specialization, req.body.doctor_contact, req.body.doctor_experience, userId, 1, afterSave); // hardcoded admin_id = 1
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