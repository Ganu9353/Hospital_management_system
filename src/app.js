const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const authRoutes = require('./routes/autoroute');
app.use('/auth', authRoutes);


module.exports = app;