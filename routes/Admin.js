const express = require("express");
const { auth, isAdmin } = require("../middlewares/auth");
const { approveOrRejectTransaction, stockTransferFromAdmin } = require("../controllers/admin/Transaction");
const { fetchAllStockists, fetchSingleStockist, createExpense, fetchAllExpenses, updateExpense } = require("../controllers/admin/Stockist");
const { createUser } = require("../controllers/Auth");
const { createCategory, updateCategory, deleteCategory, getAllCategories, getCategoryById, createProduct, updateProduct, deleteProduct, getAllProducts, getProductById } = require("../controllers/admin/Product");
const { getDeliveryChallans, fetchServiceRequestsAdmin, fetchInventoryAdmin, calculateCommission, fetchStockistPurchaseAdmin } = require("../controllers/admin/getController");
const { updateServiceAndRepairStatus } = require("../controllers/admin/ServiceAndRepair");
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
router.route("/get_all_categories").get(auth , getAllCategories);
router.route("/get_category_by_id/:id").get(auth , isAdmin , getCategoryById);

// product
router.route("/create_product").post(auth , isAdmin , createProduct);
router.route("/update_product").put(auth , isAdmin , updateProduct);
router.route("/delete_product").delete(auth , isAdmin , deleteProduct);
router.route("/get_all_products").get(auth , isAdmin , getAllProducts);
router.route("/get_product_by_id/:id").get(auth , isAdmin , getProductById);



// transaction
router.route("/stock_transfer_admin").post(auth , isAdmin , stockTransferFromAdmin);



// Expense owned by company
router.route("/create_expense").post(auth, isAdmin, createExpense);
router.route("/fetch_expenses").get(auth, isAdmin, fetchAllExpenses);
router.route("/update_expenses/:id").put(auth, isAdmin, updateExpense);


// service & repair
router.route("/update_request/:id").put(auth, isAdmin, updateServiceAndRepairStatus);


// 2% commission
router.route("/calculate_commission").post(auth , isAdmin, calculateCommission);


// get routes
router.route("/get_delivery_challans").post(auth , isAdmin , getDeliveryChallans);
router.route("/fetch_service_requests_admin").get(auth , isAdmin , fetchServiceRequestsAdmin);
router.route("/fetch_inventory/:id").get(auth , isAdmin, fetchInventoryAdmin);
router.route("/purchases/admin").get(auth , isAdmin, fetchStockistPurchaseAdmin);


module.exports = router;