const express = require("express");
const { auth, isAdmin } = require("../middlewares/auth");
const { approveOrRejectTransaction } = require("../controllers/admin/Transaction");
const router = express.Router();

router.route("/update_transaction_status").put(auth , isAdmin , approveOrRejectTransaction);


module.exports = router;