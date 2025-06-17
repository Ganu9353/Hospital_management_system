const express = require('express');
const router = express.Router();
const authController = require('../controller/autocontroller');
const { isAuthenticated, isAdmin, isDoctor, isReceptionist } = require('../middleware/authMiddleware');


router.get('/', authController.gethomepage);
router.post('/login', authController.login);
router.get('/login', authController.getloginpage);

router.get('/about', authController.getaboutpage);
router.get('/contact', authController.getcontactpage);
router.get('/AddPatient', authController.getAddPatientPage);
router.get('/logout', authController.logout);

router.get('/Admindashboard', authController.getAdmindashboard);
router.get('/Adddocter', authController.getAddDocter);

router.get('/viewdoctor',authController.viewDoctors);
router.post('/registerUser', authController.registerUser);
router.get('/register',authController.getregisterpage);
router.get('/viewreception', authController.viewReceptionist);
router.get("/deleteReception", authController.deleteReception);
router.get("/editReception", authController.editReceptionForm);
router.post("/updateReception", authController.updateReception);
router.get('/editDoctor', authController.editDoctorForm);
router.get('/deleteDoctor', authController.deleteDoctor);
router.post('/updatedocter', authController.updateDoctor);

router.get('/Docterdashboard', authController.getDocterdashboard);
router.get('/Receptiondashboard', authController.getReceptiondashboard);
router.get('/patient/add',authController.getAddPatient);


module.exports = router;
