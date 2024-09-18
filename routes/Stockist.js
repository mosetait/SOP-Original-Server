const express = require("express");
const { createTransactionStockist } = require("../controllers/stockist/Transaction");
const { auth, isStockist } = require("../middlewares/auth");
const router = express.Router();


router.route("/create_transaction_stockist").post(auth , isStockist , createTransactionStockist);


module.exports = router;