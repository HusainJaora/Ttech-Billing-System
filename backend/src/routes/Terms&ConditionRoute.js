const express = require("express");
const router = express.Router();
const { invoiceAddTerm, invoiceUpdateTerm, invoiceDeleteTerm, invoiceGetTerms } = require("../controller/invoice/invoiceterms&Condition");
const { quotationAddTerm, quotationUpdateTerm, quotationDeleteTerm, quotationGetTerms } = require("../controller/quotation/quotationterms&Conditions");
const { inquiryAddTerm, inquiryUpdateTerm, inquiryDeleteTerm, inquiryGetTerms } = require("../controller/repair/inquiryTerms&condition");
const validateToken = require("../middleware/authToken");

// Invoice 
router.post("/invoice/add", validateToken, invoiceAddTerm);
router.put("/invoice/update-terms/:term_id", validateToken, invoiceUpdateTerm);
router.delete("/invoice/delete-terms/:term_id", validateToken, invoiceDeleteTerm);
router.get("/invoice/", validateToken, invoiceGetTerms);

// Quotation
router.post("/quotation/add", validateToken, quotationAddTerm);
router.put("/quotation/update-terms/:term_id", validateToken, quotationUpdateTerm);
router.delete("/quotation/delete-terms/:term_id", validateToken, quotationDeleteTerm);
router.get("/quotation/", validateToken, quotationGetTerms);

// Inquiry
router.post("/inquiry/add", validateToken, inquiryAddTerm);
router.put("/inquiry/update-terms/:term_id", validateToken, inquiryUpdateTerm);
router.delete("/inquiry/delete-terms/:term_id", validateToken, inquiryDeleteTerm);
router.get("/inquiry/", validateToken, inquiryGetTerms);

module.exports = router;
