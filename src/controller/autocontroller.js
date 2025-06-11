const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const db = require("../config/db");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const userExists = await new Promise((resolve, reject) => {
      userModel.findUserByEmail(email, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (userExists.length > 0) {
      return res.status(400).send("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in 'users' table
    const userResult = await userModel.createUser(name, email, hashedPassword, role);
    const user_id = userResult.insertId;

    // Insert role-specific data
    if (role === "admin") {
      const { admin_contact } = req.body;
      await insertAdmin(user_id, admin_contact);
    } else if (role === "doctor") {
      const { doctor_name, doctor_specialization, doctor_contact, doctor_experience } = req.body;
      await insertDoctor(user_id, doctor_name, doctor_specialization, doctor_contact, doctor_experience);
    } else if (role === "reception") {
      const { reception_name, reception_contact } = req.body;
      await insertReception(user_id, reception_name, reception_contact);
    }

    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// Insert into admin
const insertAdmin = (user_id, admin_contact) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO admin (admin_contact, user_id) VALUES (?, ?)";
    db.query(sql, [admin_contact, user_id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// Insert into doctor
const insertDoctor = (user_id, doctor_name, specialization, contact, experience) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO doctor 
      (doctor_name, doctor_specialization, doctor_contact, doctor_experience, status, user_id) 
      VALUES (?, ?, ?, ?, 'active', ?)`;
    db.query(sql, [doctor_name, specialization, contact, experience, user_id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// Insert into reception
const insertReception = (user_id, reception_name, contact) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO reception 
      (reception_name, reception_contact, status, user_id) 
      VALUES (?, ?, 'active', ?)`;
    db.query(sql, [reception_name, contact, user_id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  res.render('sidebar.ejs');
  userModel.findUserByEmail(email, async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: { id: user.id, name: user.name, role: user.role } });
  });
};

exports.getcontactpage=(req,res)=>{
  res.render("contact.ejs");
};

exports.getregisterpage=(req,res)=>{
  res.render("register.ejs");
};
exports.gethomepage=(req,res)=>{
  res.render("homepage.ejs");
};
exports.getloginpage=(req,res)=>{
  res.render("login.ejs");
};
exports.getaboutpage=(req,res)=>{
  res.render("about.ejs");
};