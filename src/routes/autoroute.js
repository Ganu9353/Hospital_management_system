const express = require('express');
const router = express.Router();
const authController = require('../controller/autocontroller');
const app=require("../app");

router.get('/', authController.gethomepage);
router.get('/register', authController.getregisterpage);
router.get('/login', authController.getloginpage);
router.get('/about', authController.getaboutpage);
router.get('/contact', authController.getcontactpage);
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
