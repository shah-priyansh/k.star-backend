const express = require("express");
const router = express.Router();
const multer = require("multer");
const authController = require("../../controllers/AuthController");

const storage = multer.diskStorage({
  destination: "public/data/",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post(
  "/register",
  upload.single("profile_photo"),
  authController.register
);
router.post("/loginWithOTP", authController.loginWithOTP);
// Verify OTP route
router.post("/verifyOTP", authController.verifyOTP);

module.exports = router;
