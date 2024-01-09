const Customer = require("../modals/customer");
const jwt = require("jsonwebtoken");
const twilio = require('twilio');
const jwtSecretKey = process.env.JWT_SECRET_KEY || "default_secret_key";
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: "drdwwlov2",
  api_key: "179448311656386",
  api_secret: "9OQyfw-wTXna2vwG_lhNn4f9KG8",
});

const AuthController = {
  register: async (req, res) => {   
    try {
      const {
        customerName,
        fatherName,
        surname,
        villageName,
        mobileNumber,
        agentName,
      } = req.body;
      // Check if the mobile number already exists
      const existingUser = await Customer.findOne({ mobileNumber });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Mobile number already exists" });
      }
      const locaFilePath = req.file.path.replace("\\", "/");
      const { url } = await uploadToCloudinary(locaFilePath);
      // Create a new user instance
      const newUser = new Customer({
        customerName,
        fatherName,
        surname,
        villageName,
        mobileNumber,
        agentName,
        profile_photo: url || "", // Save the image URL in the database
        status: "pending",
      });
      // Save the new user to the database
      const savedUser = await newUser.save();
      res.status(201).json(savedUser); // Return the saved user details
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  loginWithOTP: async (req, res) => {
    const { mobileNumber } = req.body;

    try {
      let user = await Customer.findOne({ mobileNumber });

      if (!user) {
        return res.status(400).json({ message: "User not registered" });
      }

      // Generate and set the OTP
      const otp = generateOTP();
      user.otp = otp;
      await user.save();

      const accountSid = "AC8c941d2e3ec5d887f189124dd4f7b8ad";
      const authToken = "35731b93d89628fa9489d85f1dbaa80f";
      const verifySid = "VA15e377d07587d43708b387706a1a0928";
      const client = require("twilio")(accountSid, authToken);

      // Send OTP via Twilio SMS
      client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${mobileNumber}`, channel: "sms" })
        .then((verification) => {
          console.log(verification.status);

          // Prompt user to enter OTP (for testing purposes, you may want to send this to Postman)
          const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          readline.question("Please enter the OTP:", (otpCode) => {
            client.verify.v2
              .services(verifySid)
              .verificationChecks.create({
                to: `+91${mobileNumber}`,
                code: otpCode,
              })
              .then((verification_check) => {
                console.log(verification_check.status);
                readline.close();

                // Log for debugging (avoid logging sensitive information in production)
                console.log("OTP generated and sent to user:", user._id);

                // Send a success response
                res
                  .status(200)
                  .json({
                    message: "OTP generated and sent successfully",
                    userId: user._id,
                  });
              })
              .catch((error) => {
                console.error(
                  `Error during OTP verification check: ${error.message}`
                );
                res
                  .status(500)
                  .json({
                    message:
                      "Server error occurred during OTP verification check",
                  });
              });
          });
        })
        .catch((error) => {
          console.error(`Error sending OTP: ${error.message}`);
          res
            .status(500)
            .json({ message: "Server error occurred during OTP generation" });
        });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Server error occurred during login with OTP" });
    }
  },

  verifyOTP: async (req, res) => {
    const { mobileNumber, enteredOTP } = req.body;

    try {
      console.log(
        "Received OTP verification request for mobile number:",
        mobileNumber
      );

      let user = await Customer.findOne({ mobileNumber });
      if (!user) {
        console.log("User not found for mobile number:", mobileNumber);
        return res.status(400).json({ message: "User not registered" });
      }

      // Check if the entered OTP matches the stored OTP
      if (user.otp !== enteredOTP) {
        console.log("Invalid OTP entered for mobile number:", mobileNumber);
        return res.status(401).json({ message: "Invalid OTP" });
      }

      // Update user status to "active" upon successful OTP verification
      user.status = "active";
      await user.save();

      // Issue a JWT token after successful OTP verification and user activation
      const token = jwt.sign({ userId: user._id }, jwtSecretKey, {
        expiresIn: "1h",
      });

      console.log(
        'User status updated to "active" for mobile number:',
        mobileNumber
      );
      console.log("JWT Token generated for user:", user._id);

      // Decode the token to get user ID
      const decodedToken = jwt.verify(token, jwtSecretKey);
      const userId = decodedToken.userId;

      res
        .status(200)
        .json({ message: "OTP verified successfully", token, userId });
    } catch (error) {
      console.error("Error during OTP verification:", error);
      res
        .status(500)
        .json({ message: "Server error occurred during OTP verification" });
    }
  },

 
  uploadToCloudinary: async (locaFilePath) => {
    var mainFolderName = "main";
    var filePathOnCloudinary = mainFolderName + "/" + locaFilePath;
    const path = filePathOnCloudinary.replace(/\\/g, "/");
    return cloudinary.uploader
      .upload(locaFilePath, { public_id: path })
      .then((result) => {
        fs.unlinkSync(locaFilePath);
        return {
          status: 200,
          message: "Success",
          url: result.url,
        };
      })
      .catch((error) => {
        fs.unlinkSync(locaFilePath);
        return { status: 400, message: error };
      });
  },
};
module.exports = AuthController;
