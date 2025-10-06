const express = require("express");
const router = express.Router();
const login = require("../controller/userAuthController");
const getAuthStatus = require("../controller/userAuthStatus");
const validateToken = require("../middleware/authToken");
const {validateLogin,loginLimiter} = require("../middleware/uservalidation");



// router.post('/signup',signupValidation,validateDuplicateUser,signup);
router.get("/status",validateToken,getAuthStatus);
router.post('/login',loginLimiter,validateLogin,login);


module.exports = router;