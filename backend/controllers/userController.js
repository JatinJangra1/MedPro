const bcrypt = require("bcrypt");
const validator = require("validator");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const cloudinary = require('cloudinary').v2;
const Razorpay = require('razorpay');
const otpModel = require("../models/otpModel");

// exports.registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing details",
//       });
//     }

//     if (!validator.isEmail(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Enter a valid email",
//       });
//     }

//     if (password.length < 8) {
//       return res.status(400).json({
//         success: false,
//         message: "Enter a strong password (min 8 characters)",
//       });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = new userModel({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     const user = await newUser.save();

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res.status(201).json({
//       success: true,
//       token,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };



// Updated register controller enabling otp authentication also
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp)
      return res.status(400).json({ message: "All fields are required" });

    const matchedOtp = await otpModel.findOne({ email, otp });
    if (!matchedOtp)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    await otpModel.deleteMany({ email }); // cleanup

    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.status(201).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// API for user Login
exports.loginUser = async (req, res) => {
  try {
    console.log("Body received",req.body);
    const {email,password} = req.body;
    const user = await userModel.findOne({email});
    if(!user){
        return res.json({
            success:false,
            message :'User does not exist'
        })
    }
    //if password matches
    const isMatch = await bcrypt.compare(password,user.password);
    if(isMatch){
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET);
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
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// controller to get user profile data
exports.getProfile = async(req,res)=>{
  try{
    const userId = req.user?.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "No user ID provided" });
    }
    const userData = await userModel.findById(userId).select('-password');
    res.json({
      success:true,
      userData
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

// controller to update User Profile data
exports.updateProfile = async(req,res)=>{
  try{
    const userId = req.user.userId;
    const {name,phone,address,dob,gender} = req.body;
    // console.log(userId);
     const imageFile = req.file;
     if(!name || !phone || !address || !dob || !gender){
      return res.json({
        success:false,
        message:'Data Missing'
      })
     }

     await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender});
     if(imageFile){
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'});
      const imageUrl = imageUpload.secure_url;
      await userModel.findByIdAndUpdate(userId,{image:imageUrl})
     }

     res.json({
      success:true,
      message :'Profile Updated'
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

// controller to book appointment
exports.bookAppointment = async(req,res)=>{
  try{
    const userId = req.user.userId;
    const {docId,slotDate,slotTime} = req.body;
    const docData = await doctorModel.findById(docId).select('-password');
    if(!docData.available){
      return res.json({
        success:false,
        message :'Doctor is not Available'
      })
    }
    let slotsBooked = docData.slotsBooked;
    // checking for slot availability
    if(slotsBooked[slotDate]){
      if(slotsBooked[slotDate].includes(slotTime)){
        return res.json({
        success:false,
        message :'Slot is not Available'
      })
      }
      else{
        // slot is free so we can book slot
        slotsBooked[slotDate].push(slotTime);
      }
    }
    else{
      slotsBooked[slotDate] = [];
      slotsBooked[slotDate].push(slotTime);
    }
    const userData = await userModel.findById(userId).select('-password');
    delete docData.slotsBooked;
    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount:docData.fees,
      slotTime,
      slotDate,
      date : Date.now(),

    }
    const newappointment = new appointmentModel(appointmentData);
    await newappointment.save();

    // save new slots Data in doctors data 
    await doctorModel.findByIdAndUpdate(docId,{slotsBooked});
    res.json({
      success:true,
      message :'Appointment Booked'
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

// controller for get detials for my-appointment page
exports.listAppointment = async(req,res)=>{
  try{
    const userId = req.user.userId;
    const appointments = await appointmentModel.find({userId});
    res.json({
      success:true,
      appointments,
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

// controller to cancel Appointment
exports.cancelAppointment = async(req,res)=>{
  try{
    const userId = req.user.userId;
    console.log("Authenticated user:", userId);
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
    // verify appointment user
    if (appointmentData.userId.toString() !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }
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

// var razorpayInstance = new Razorpay({
//   key_id :'',
//   key_secret :''
// })

// // logic for payment through razorpay
// exports.paymentRazorpay = async(req,res)=>{
//   try{
//     const {appointmentId} = req.body;
//     const appointmentData = await appointmentModel.findById(appointmentId);
//     if(!appointmentData || appointmentData.cancelled){
//       return res.json({
//         success :false,
//         message :'Appointment cancelled or not found'
//       })
//     }
//     // creating options for razorpay payment
//     const options ={
//       amount:appointmentData.amount*100,
//       currency :process.env.CURRENCY,
//       receipt :appointmentId 

//     }
//     // creation of an order
//     const order = razorpayInstance.orders.create(options);

//     res.json({
//       success :true,
//       order
//     })
//   }
//   catch(err){
//     console.log(err);
//     res.json({
//       success: false,
//       message: err.message,
//     })
//   }
// }



// sendOtp controller
// const otpModel = require("../models/otpModel");
const { sendOTPEmail } = require("../utils/sendOTP");

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await otpModel.deleteMany({ email }); // Clear previous OTPs
    await otpModel.create({ email, otp });

    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};



