
const express = require('express');
const adminRouter = express.Router();
const upload  = require('../middleware/multer');
const { addDoctor,loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard } = require('../controllers/adminController');
const { authAdmin } = require('../middleware/authAdmin');
const { changeAvailability } = require('../controllers/doctorController');

adminRouter.post('/add-doctor',upload.single('image'),authAdmin,addDoctor)
adminRouter.post('/login',loginAdmin);

adminRouter.post('/all-doctors',authAdmin,allDoctors);
adminRouter.post('/change-availability',authAdmin,changeAvailability);
adminRouter.get('/appointments',authAdmin,appointmentsAdmin);
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel);
adminRouter.get('/dashboard',authAdmin,adminDashboard);
module.exports = adminRouter;