const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  userModel.findUserByEmail(email, async (err, results) => {
    if (results.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    userModel.createUser(name, email, hashedPassword, role, (err) => {
      if (err) return res.status(500).json({ message: 'Registration failed' });
      res.status(201).json({ message: 'User registered successfully' });
      
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  userModel.findUserByEmail(email, async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: { id: user.id, name: user.name, role: user.role } });
  });
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