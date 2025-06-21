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
router.get('/Docterdashboard',  isDoctor, authController.getDocterdashboard);

// Receptionist-only dashboard
router.get('/Receptiondashboard', isAuthenticated, isReceptionist, authController.getReceptiondashboard);

// Common authenticated route
 // duplicate? keep if needed
router.get('/room/add',isAuthenticated,isReceptionist, authController.getAddroomPage);
router.post('/save-room',isAuthenticated,isReceptionist, authController.saveRoom);
router.get('/room/list',isAuthenticated,isReceptionist, authController.showRoomlist);
router.get('/nurse/add',isAuthenticated,isReceptionist, authController.getAddNursePage);
router.post('/save-nurse',isAuthenticated,isReceptionist, authController.saveNurse);
router.get('/nurse/list',isAuthenticated,isReceptionist, authController.viewNurses);



router.get('/rooms/edit',isAuthenticated,isReceptionist, authController.editRoomForm);
router.post('/room/update',isAuthenticated,isReceptionist, authController.updateRoom);
router.get('/rooms/delete',isAuthenticated,isReceptionist, authController.deleteRoom);

router.get('/nurses/edit', isAuthenticated,isReceptionist,authController.editNurseForm);
router.post('/nurse/update',isAuthenticated,isReceptionist, authController.updateNurse);
router.get('/nurses/delete', authController.deleteNurse);

router.get('/patient/add',isAuthenticated,isReceptionist, authController.getAddPatientForm);
router.post('/patient/add',isAuthenticated,isReceptionist, authController.savePatient);
router.get('/viewPatients',isAuthenticated,isReceptionist, authController.viewPatients);
router.get('/editPatient', isAuthenticated,isReceptionist,authController.editPatientForm);
router.post('/updatePatient', isAuthenticated,isReceptionist,authController.updatePatient);



router.get('/generatebill', isAuthenticated,isReceptionist,authController.generateBillForm);
router.post('/billing/generate',isAuthenticated,isReceptionist, authController.generateBill);
router.get('/billing/list',isAuthenticated,isReceptionist, authController.viewBills);
router.get('/billing/pay',isAuthenticated,isReceptionist, authController.payBill);
router.get('/billing/download',isAuthenticated,isReceptionist, authController.downloadBill);



router.get('/getAllpatients',isAuthenticated,isDoctor, authController.viewAllPatients);
router.get('/doctor/add-medicine/:id',isAuthenticated,isDoctor, authController.addMedicineForm);
router.post('/doctor/add-medicine',isAuthenticated,isDoctor, authController.saveMedicine);
router.get('/medicine/list/:id',isAuthenticated,isDoctor, authController.viewMedicine);
router.post('/delete-medicine/:id', isAuthenticated,isDoctor,authController.deleteMedicine);
module.exports = router;
