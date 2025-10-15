const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const ensureAdmin = require("../../middleware/ensureadmin");
const {signupValidation, validateDuplicateUser} = require("../../middleware/uservalidation");
const signup = require("../../controller/admin/createUser");
const {getAllUser} = require("../../controller/admin/adminDashboard");

router.get('/',validateToken,ensureAdmin,getAllUser);
router.post('/create-user',validateToken,ensureAdmin,signupValidation,validateDuplicateUser,signup);


module.exports = router;