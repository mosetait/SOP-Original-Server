const express = require("express");
const { auth, isAdmin } = require("../middlewares/auth");
const { approveOrRejectTransaction } = require("../controllers/admin/Transaction");
const { fetchAllStockists, fetchSingleStockist } = require("../controllers/admin/Stockist");
const { createUser } = require("../controllers/Auth");
const router = express.Router();

router.route("/update_transaction_status").put(auth , isAdmin , approveOrRejectTransaction);


// stockist.js
router.route("/fetch_all_stockists").get(auth , isAdmin , fetchAllStockists);
router.route("/fetch_single_stockists/:id").get(auth , isAdmin , fetchSingleStockist);


// auth.js
router.route("/create_stockist").post(auth , isAdmin , createUser);

module.exports = router;