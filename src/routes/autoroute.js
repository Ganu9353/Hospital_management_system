const express = require('express');
const router = express.Router();
const authController = require('../controller/autocontroller');
const {
  isAuthenticated,
  isAdmin,
  isDoctor,
  isReceptionist
} = require('../middleware/authMiddleware');

// Public routes
router.get('/', authController.gethomepage);
router.get('/about', authController.getaboutpage);
router.get('/contact', authController.getcontactpage);
router.get('/login', authController.getloginpage);
router.post('/login', authController.login);
router.get('/register', authController.getregisterpage);
router.post('/registerUser', isAuthenticated, isAdmin, authController.registerUser); // Only admin can register

// Logout
router.get('/logout', authController.logout);

// Admin-only routes
router.get('/Admindashboard', isAuthenticated, isAdmin, authController.getAdmindashboard);
router.get('/Adddocter', isAuthenticated, isAdmin, authController.getAddDocter);
router.get('/viewdoctor', isAuthenticated, isAdmin, authController.viewDoctors);
router.get('/viewreception', isAuthenticated, isAdmin, authController.viewReceptionist);
router.get('/editDoctor', isAuthenticated, isAdmin, authController.editDoctorForm);
router.post('/updatedocter', isAuthenticated, isAdmin, authController.updateDoctor);
router.get('/deleteDoctor', isAuthenticated, isAdmin, authController.deleteDoctor);
router.get('/deleteReception', isAuthenticated, isAdmin, authController.deleteReception);
router.get('/editReception', isAuthenticated, isAdmin, authController.editReceptionForm);
router.post('/updateReception', isAuthenticated, isAdmin, authController.updateReception);
router.get('/addReceptionist', isAuthenticated, isAdmin, authController.AddReceptionist);

// Doctor-only dashboard
router.get('/Docterdashboard', isAuthenticated, isDoctor, authController.getDocterdashboard);

// Receptionist-only dashboard
router.get('/Receptiondashboard', isAuthenticated, isReceptionist, authController.getReceptiondashboard);

// Common authenticated route
router.get('/patient/add', isAuthenticated,isReceptionist, authController.getAddPatientPage);
router.get('/patient/add', isAuthenticated,isReceptionist, authController.getAddPatient); // duplicate? keep if needed
router.get('/room/add',isAuthenticated,isReceptionist, authController.getAddroomPage);
router.post('/save-room',isAuthenticated,isReceptionist, authController.saveRoom);
router.get('/room/list',isAuthenticated,isReceptionist, authController.showRoomlist);
router.get('/nurse/add',isAuthenticated,isReceptionist, authController.getAddNursePage);
router.post('/save-nurse',isAuthenticated,isReceptionist, authController.saveNurse);
router.get('/nurse/list',isAuthenticated,isReceptionist, authController.viewNurses);
module.exports = router;
