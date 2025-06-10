const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'hospital-secret',
  resave: false,
  saveUninitialized: false,
}));


app.use(require('./routes/autoroute'));


module.exports = app;