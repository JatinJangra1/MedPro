const express = require('express');
const { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, sendOtp } = require('../controllers/userController');
const { authUser } = require('../middleware/authUser');
const multer = require('multer');
const upload = require('../middleware/multer');

const userRouter = express.Router();

userRouter.post("/send-otp", sendOtp);// route for otp
userRouter.post('/register', registerUser);
userRouter.post('/login',loginUser);
userRouter.get('/get-profile',authUser,getProfile);
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile);
userRouter.post('/book-appointment',authUser,bookAppointment);
userRouter.get('/appointments',authUser,listAppointment);
userRouter.post('/cancel-appointment',authUser,cancelAppointment);
// userRouter.post('/payment-razorpay',authUser,paymentRazorpay);
module.exports = userRouter;
