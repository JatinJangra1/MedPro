const validator = require('validator')
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const doctorModel = require('../models/doctorModel');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const appointmentModel = require('../models/appointmentModel');
const userModel = require('../models/userModel');
// API for adding doctor
exports.addDoctor  = async(req,res)=>{
    try{
         const {name,email,password,speciality,degree,experience,about,fees,address} = req.body;
         const imageFile = req.file;
        //  console.log(imageFile);
        //  console.log({name,email,password,speciality,degree,experience,about,fees,address});
         //  checking for all data to add doctor
         if(!name || !email || !password || !speciality || !degree || !about || !experience || !fees || !address){
             return res.json({
                success:false,
                message :'Missing Details'
             })
         }
         // we have all data and now validate email
         // validating email format
         if(!validator.isEmail(email)){
            return res.json({
                success:false,
                mesage :'Please enter a valid email'
            })
         }
         // validating strong password
         if(password.length<8){
            return res.json({
                success :false,
                message :'please enter a strong password of atleast 8 length'
            })
         }
         // hashing doctor password
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password,salt);
         console.log("Hashed password ",hashedPassword);

         // Upload image to cloudinary
         const imageUpload = await  cloudinary.uploader.upload(imageFile.path,{resource_type :"image"});
         const imageUrl = imageUpload.secure_url;
         
         const doctorsData = {
            name,email,
            image :imageUrl,
            password :hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address :JSON.parse(address),
            date :Date.now(),

         }
         const newDoctor = new doctorModel(doctorsData);
         await newDoctor.save();
        res.json({
            success:true,
            message :'Doctor Added successfully'
        });

    }
    catch(err){
        console.log(err);
        res.json({
            success:false,
            message :err.message
        })
    }
}

// API for Admin Login
exports.loginAdmin = async(req,res)=>{
    try{
        const {email,password} = req.body;
        // checking enteries entered or not
        if(!email || !password){
            res.json({
                success:false,
                mesage :'Missing Details'
            })
        }
        // check email and password are matching with admin email and admin password if yes generate token
        if(email===process.env.ADMIN_EMAIL && password ===process.env.ADMIN_PASSWORD){
            // generate token and send it to user
            const payload = {
                email :{email},
                password :{password}
            };
            const token = jwt.sign(payload,process.env.JWT_SECRET,{ expiresIn: '24h' });
            console.log(token);
            res.json({
                success:true,
                token
            });
        }
        else{
            // console.log('Invalid credentials');
            res.json({
                success:false,
                message :'Invalid Credentials'
            })
        }
    }
    catch(err){
        console.log(err);
        res.json({
            success:false,
            mesage :err.mesage
        })
    }
}


// API to get all doctors list from Admin Panel
exports.allDoctors = async(req,res)=>{
    try{
        const doctors = await doctorModel.find({}).select('-password')
        res.json({
            success:true,
            doctors
        })
    }
    catch(err){
        console.log(err);
        res.json({
            success :false,
            mesage:err.mesage
        })
    }
}


// API to get all-appointments list
exports.appointmentsAdmin = async(req,res)=>{
    try{
        const appointments = await appointmentModel.find({});
        res.json({
            success:true,
            appointments
        })
    }
    catch(err){
        console.log(err);
        res.json({
            success :false,
            mesage:err.mesage
        })
    }
}

// API for Appointment Cancellation
exports.appointmentCancel = async(req,res)=>{
  try{
    // const userId = req.user.userId;
    // console.log("Authenticated user:", userId);
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.json({ success: false, message: "No appointmentId provided" });
    }
    // fetching appointment Data
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      // ← add this!
      return res.json({ success: false, message: "Appointment not found" });
    }
    // // verify appointment user
    // if (appointmentData.userId.toString() !== userId) {
    //   return res.json({ success: false, message: "Unauthorized action" });
    // }
    await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true}); 

    // releasing doctor slot
   const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);  // ◀️ FETCH this!
    if (!doctorData) {
      console.warn("Doctor not found for appointment", docId);
    } else {
      const slotsBooked = doctorData.slotsBooked || {};
      // Remove the cancelled time slot
      slotsBooked[slotDate] = (slotsBooked[slotDate] || []).filter(
        (t) => t !== slotTime
      );
      await doctorModel.findByIdAndUpdate(docId, { slotsBooked });
    }
    res.json({
      success:true,
      message:'Appointment Cancelled'
    })
  }
  catch(err){
    console.log(err);
    res.json({
      success: false,
      message: err.message,
    });
  }
}

// API to get Dashboard data for admin Panel
exports.adminDashboard = async(req,res)=>{
    try{
        const doctors = await doctorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({});
        const dashData = {
            doctors :doctors.length,
            patients :users.length,
            appointments :appointments.length,
            latestAppointments :appointments.reverse().slice(0,5)
        }
        res.json({
            success:true,
            dashData
        })
    }
    catch(err){
        console.log(err);
        res.json({
        success: false,
        message: err.message,
        });
    }
}