const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {deleteSupplier,deleteTechnician,deleteProductCategories} = require("../../controller/Master/deleteMasterController");

// supplier
router.delete("/supplier/:supplier_id",validateToken,deleteSupplier);
// Technician
router.delete("/technician/:technician_id",validateToken,deleteTechnician);
// Product category
router.delete("/product-category/:product_category_id",validateToken,deleteProductCategories);


module.exports = router;    