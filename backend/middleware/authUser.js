

const jwt = require("jsonwebtoken");
require("dotenv").config();
// admin authentication middleware using for authentication
exports.authUser = async (req, res, next) => {
  try {
    // extract jwt token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({
        success: false,
        message: "Authorization header missing or malformed",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log(token);
    if (!token || token === undefined) {
      return res.json({
        success: false,
        message: "Token Missing",
      });
    }
    // verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decode);
      req.user = { userId: decode.id }
      console.log(req.user.userId);
      // res.json({
      //     success:true,
      //     message:'thank you for login'
      // })
    } catch (err) {
        console.log(err);
      return res.json({
        success: false,
        message: "token is Invalid & User is not Authorised",
      });
    }
    next();
  } catch (err) {
    console.log(err.message);
    return res.json({
      success: false,
      message: "Something Went Wrong while verifying the token",
      error: err.message,
    });
  }
};
