const express = require("express");
const { BalanceTransferStockist } = require("../controllers/stockist/Transaction");
const { auth, isStockist } = require("../middlewares/auth");
const { FetchStockistDeposits } = require("../controllers/Common");
const router = express.Router();


router.route("/balance_transfer_stockist").post(auth , isStockist , BalanceTransferStockist);

router.route("/fetch_stockist_deposits/:id").get(auth , isStockist , FetchStockistDeposits);


module.exports = router;