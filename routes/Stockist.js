const express = require("express");
const { BalanceTransferStockist } = require("../controllers/stockist/Transaction");
const { auth, isStockist } = require("../middlewares/auth");
const { FetchStockistDeposits } = require("../controllers/Common");
const { getDeliveryChallansForStockist, fetchInventory, fetchAllExpensesStockist } = require("../controllers/stockist/getControllers");
const { createServiceAndRepair, fetchServiceRequests } = require("../controllers/stockist/ServiceAndRepair");
const { getStockistSales, createSale } = require("../controllers/stockist/Sale");
const router = express.Router();


router.route("/balance_transfer_stockist").post(auth , isStockist , BalanceTransferStockist);

router.route("/fetch_stockist_deposits/:id").get(auth , isStockist , FetchStockistDeposits);



// service & repair
router.route("/create_request").post(auth, isStockist, createServiceAndRepair);


// sale
router.route("/create_sale").post(auth, isStockist, createSale);


// get controllers
router.route("/get_delivery_challans_4stockist").post(auth , isStockist, getDeliveryChallansForStockist);
router.route("/fetch_inventory").get(auth , isStockist, fetchInventory);
router.route("/fetch_expenses_stk").get(auth , isStockist, fetchAllExpensesStockist);
router.route("/fetch_service_requests").get(auth , isStockist, fetchServiceRequests);
router.route("/get_stockist_sales").get(auth , isStockist, getStockistSales);




module.exports = router;