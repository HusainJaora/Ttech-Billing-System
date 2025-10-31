const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {getAllSuppliers,getSingleSupplier, getAllTechnician, getSingleTechnician, getAllProductCategory,getSingleProductCategory} = require("../../controller/Master/getMasterController");

router.get("/supplier-list",validateToken,getAllSuppliers);
router.get("/supplier-detail/:supplier_id",validateToken,getSingleSupplier);

router.get("/technician-list",validateToken,getAllTechnician);
router.get("/technician-detail/:technician_id",validateToken,getSingleTechnician);

router.get("/product-category-list",validateToken,getAllProductCategory);
router.get("/product-category-detail/:product_category_id",validateToken,getSingleProductCategory);

module.exports = router;