const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // ⏰ expires in 5 minutes
  }
});

const otpModel = mongoose.models.otp || mongoose.model("otp", otpSchema);

module.exports = otpModel;
