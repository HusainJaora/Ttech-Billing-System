const express = require("express");
const router = express.Router();
const {addInquiry,updateInquiry,deleteInquiry,getAllInquiries,getSingleInquiry,getInquiryReceipt} = require("../../controller/repair/inquiry");
const validateToken = require("../../middleware/authToken");
const {addinquiryValidation,updateInquiryValidation,deleteInquiryValidation} = require("../../middleware/inquiryvalidation");

router.get("/",validateToken,getAllInquiries);
router.get("/inquiry-detail/:inquiry_id",validateToken,getSingleInquiry);
router.get("/receipt/:inquiry_id", validateToken, getInquiryReceipt);
router.post("/add-inquiry",validateToken,addinquiryValidation,addInquiry);
router.put("/update-inquiry/:inquiry_id",validateToken,updateInquiryValidation,updateInquiry);
router.delete("/delete-inquiry/:inquiry_id",validateToken,deleteInquiryValidation,deleteInquiry);


 

module.exports = router;
