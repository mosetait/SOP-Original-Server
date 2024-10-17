const express = require("express");
const { auth, isAdmin } = require("../middlewares/auth");
const { approveOrRejectTransaction, stockTransferFromAdmin } = require("../controllers/admin/Transaction");
const { fetchAllStockists, fetchSingleStockist } = require("../controllers/admin/Stockist");
const { createUser } = require("../controllers/Auth");
const { createCategory, updateCategory, deleteCategory, getAllCategories, getCategoryById, createProduct, updateProduct, deleteProduct, getAllProducts, getProductById } = require("../controllers/admin/Product");
const { getDeliveryChallans } = require("../controllers/admin/getController");
const router = express.Router();

router.route("/update_transaction_status").put(auth , isAdmin , approveOrRejectTransaction);


// stockist.js
router.route("/fetch_all_stockists").get(auth , isAdmin , fetchAllStockists);
router.route("/fetch_single_stockists/:id").get(auth , isAdmin , fetchSingleStockist);


// auth.js
router.route("/create_stockist").post(auth , isAdmin , createUser);


// category
router.route("/create_category").post(auth , isAdmin , createCategory);
router.route("/update_category").put(auth , isAdmin , updateCategory);
router.route("/delete_category").delete(auth , isAdmin , deleteCategory);
router.route("/get_all_categories").get(auth , isAdmin , getAllCategories);
router.route("/get_category_by_id/:id").get(auth , isAdmin , getCategoryById);

// product
router.route("/create_product").post(auth , isAdmin , createProduct);
router.route("/update_product").put(auth , isAdmin , updateProduct);
router.route("/delete_product").delete(auth , isAdmin , deleteProduct);
router.route("/get_all_products").get(auth , isAdmin , getAllProducts);
router.route("/get_product_by_id/:id").get(auth , isAdmin , getProductById);



// transaction
router.route("/stock_transfer_admin").post(auth , isAdmin , stockTransferFromAdmin);



// get routes
router.route("/get_delivery_challans").post(auth , isAdmin , getDeliveryChallans);


module.exports = router;