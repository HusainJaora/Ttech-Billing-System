const express = require("express");
const router = express.Router();
const logout = require("../controller/logoutController");

router.post("/",logout); 
module.exports = router