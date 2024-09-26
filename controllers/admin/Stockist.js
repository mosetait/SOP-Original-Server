const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const asyncHandler = require("../../middlewares/asyncHandler");
const mongoose = require("mongoose")



// fetch all stockists
exports.fetchAllStockists = asyncHandler( async (req,res) => {

    const stockists = await User.find({role: "stockist"});

    return res.status(200).json({
        message: "Stockists Fetched Successfully",
        success: true,
        stockists
    })

})


// fetch all details of a single stockist
exports.fetchSingleStockist = asyncHandler( async (req,res) => {

    const {id} = req.params;

    const stockist = await User.findOne({_id: id});

    const wallet = await Wallet.findOne({user: id}).populate({path: "transactionHistory"});

    if(!stockist) {
        return res.status(404).json({
            message: "Stockist Not Found",
            success: false
        })
    }

    if(!wallet) {
        return res.status(404).json({
            message: "Stockist's Wallet Not Found",
            success: false
        })
    }

    const pendingOrRejectedTransactions = await Transaction.find({
        status: { $in: ['pending', 'rejected'] },
        fromUser: id
    });
    
    return res.status(200).json({
        message: "Stockist fetched successfully",
        stockist,
        wallet,
        pendingOrRejectedTransactions
    })

})