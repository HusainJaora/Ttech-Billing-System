const express = require("express");
const router = express.Router();
const checkCustomerByContact = require("../utils/checkExistingCustomer");
const validateToken = require("../middleware/authToken");
const checkCustomerByContactValidation = require("../middleware/utilsCheckExistingCustomerValidation");

router.post("/by-contact",validateToken,checkCustomerByContactValidation,checkCustomerByContact);

module.exports = router;