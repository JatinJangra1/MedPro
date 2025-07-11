const doctorModel = require("../models/doctorModel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const appointmentModel = require("../models/appointmentModel");
exports.changeAvailability = async(req,res)=>{
    try{
        const {docId } = req.body;
        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId,{available:!docData.available});
        res.json({
            success:true,
            message:'Availability Changed'
        })
    }
    catch(err){
        console.log(err);
        res.json({
            success:false,
            message :err.message
        })
    }
}
exports.doctorList = async(req,res)=>{
    try{
        const doctors = await doctorModel.find({}).select('-password,-email');
        // console.log(doctors);
        res.json({
            success:true,
            doctors
        })
    }
    catch(err){
       console.log(err);
        res.json({
            success:false,
            message :err.message
        })
    }
}

// API for doctor Login
exports.loginDoctor = async(req,res)=>{
    try{
        const {email,password } = req.body;
        const doctor = await doctorModel.findOne({email});
        if(!doctor){
            return res.json({
                success:false,
                message :'Invalid Credentials'
            })
        }
        const isMatch = await bcrypt.compare(password,doctor.password);
        if(isMatch){
            const token = jwt.sign({id:doctor._id},process.env.JWT_SECRET);
            res.json({
                success:true,
                token
            })
        }
        else{
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
            message :err.message
        })
    }
}

// API to get doctor appointments for doctor Panel
exports.appointmentsDoctor = async(req,res)=>{
    try{
        const docId = req.user.id;
        const appointments  = await appointmentModel.find({docId});
        res.json({
            success:true,
            appointments
        })
    }
    catch(err){
        console.log(err);
        res.json({
            success:false,
            message :err.message
        })
    }
}

// API to mark appointment completed for doctor Panel
exports.appointmentComplete = async(req,res)=>{
    try{
        const docId  = req.user.id;
        const {appointmentId} = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);
        if(appointmentData && appointmentData.docId == docId){
            await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true});
            return res.json({
                success :true,
                message :'Appointment Completed'
            })
        }
        else{
            res.json({
                success :false,
                message :'Mark Failed'
            })
        }
    }
    catch(err){
        console.log(err);
        res.json({
            success:false,
            message :err.message
        })
    }
}
// API to cancel appointment for doctor Panel
exports.appointmentCancel = async(req,res)=>{
    try{
        const docId  = req.user.id;
        const {appointmentId} = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);
        if(appointmentData && appointmentData.docId == docId){
            await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true});
            return res.json({
                success :true,
                message :'Appointment Cancelled'
            })
        }
        else{
            res.json({
                success :false,
                message :'Cancellation Failed'
            })
        }
    }
    catch(err){
        console.log(err);
        res.json({
            success:false,
            message :err.message
        })
    }
}

// API to get dashboard data for Doctor Panel
exports.doctorDashboard = async(req,res)=>{
    try{
        const docId  = req.user.id;
        const appointments = (await appointmentModel.find({docId}));
        let earnings =0;
        appointments.map((item)=>{
            if(item.isCompleted || item.payment){
                earnings +=item.amount;
            }
        })

        let patients =[];
        appointments.map((item)=>{
            if(!patients.includes(item.userId)){
                patients.push(item.userId);
            }
        })
        const dashData = {
            earnings,
            appointments:appointments.length,
            patients:patients.length,
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
            success:false,
            message :err.message
        })
    }
}

// API to get doctor Profile for Doctor Panel
exports.doctorProfile = async(req,res)=>{
    try{
        const docId  = req.user.id;
        const profileData = await doctorModel.findById(docId).select('-password');
        res.json({
            success:true,
            profileData
        })
    }
    catch(err){
         console.log(err);
        res.json({
            success:false,
            message :err.message
        })
    }
}

// API to update Doctor Profile Data
exports.updateDoctorProfile = async(req,res)=>{
    try{
        const docId  = req.user.id;
        const {fees,address,available} = req.body;
        await doctorModel.findByIdAndUpdate(docId,{fees,address,available});
        res.json({
            success :true,
            message :'Doctor Profile Updated'
        })
    }
    catch(err){
        console.log(err);
        res.json({
            success:false,
            message :err.message
        })
    }
}


// For chatbot setup
 