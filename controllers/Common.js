const Transaction = require("../models/Transaction.js");
const User = require("../models/User");
const Wallet  = require("../models/Wallet");
const asyncHandler = require("../middlewares/asyncHandler");



// fetch all deposit transactions of a Stockist
exports.FetchStockistDeposits = asyncHandler( async (req,res) => {

    const {id} = req.params;

    const wallet = await Wallet.findOne({ user: id }).populate({path: "transactionHistory"});

    const pendingOrRejectedTransactions = await Transaction.find({
        status: { $in: ['pending', 'rejected'] },
        fromUser: id
      });

    if(!wallet){
        return res.status(404).json({
            message: "Wallet for the given user not found",
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        wallet,
        pendingOrRejectedTransactions
    })

})