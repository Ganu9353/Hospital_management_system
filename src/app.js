const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
require('dotenv').config();

const authRoutes = require('../src/routes/autoroute');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'..', 'public')));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
}));

app.use('/', authRoutes);

// 404
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

module.exports = app;