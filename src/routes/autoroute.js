const express = require('express');
const router = express.Router();
const authController = require('../controller/autocontroller');
const app=require("../app");


router.get('/register', authController.getregisterpage);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/', (req, res)=>{
    res.send("welcome to my page");
});

module.exports = router;
