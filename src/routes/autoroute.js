const express = require('express');
const router = express.Router();
const authController = require('../controller/autocontroller');

router.get('/', authController.gethomepage);
router.get('/register', authController.getregisterpage);
router.get('/login', authController.getloginpage);
router.get('/about', authController.getaboutpage);
router.get('/contact', authController.getcontactpage);
router.get('/AddPatient', authController.getAddPatientPage);
router.get('/logout', authController.logout)
router.get('/Adddocter', authController.getAddDocter);
router.get('/Insurance', authController.getInsurance);
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});
router.get('/Admindashboard', authController.getAdmindashboard);
router.get('/Docterdashboard', authController.getDocterdashboard);
router.get('/viewreception', authController.viewReceptionist);
router.get("/deleteReception", authController.deleteReception);

router.get("/editReception", authController.editReceptionForm);
// Update POST route
router.post("/updateReception", authController.updateReception);
router.get('/viewdoctor',authController.viewDoctors);

router.get('/editDoctor', authController.editDoctorForm);
router.get('/deleteDoctor', authController.deleteDoctor);
router.post('/update', authController.updateDoctor);
router.get('/Receptiondashboard', authController.getReceptiondashboard);
router.post('/login', authController.login);


module.exports = router;
