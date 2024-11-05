const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const Inventory = require("../../models/Inventory");
const Product = require("../../models/Product");
const DeliveryChallan = require("../../models/DeliveryChallan");
const asyncHandler = require("../../middlewares/asyncHandler");
const mongoose = require("mongoose")






// Approve or Reject a Transaction
exports.approveOrRejectTransaction = asyncHandler(async (req, res) => {

  const { transactionId, status , stockistId } = req.body;

  // Check if the transactionId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    return res.status(400).json({ msg: "Invalid transaction ID" });
  }

  // Check if the status is either 'approved' or 'rejected'
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ msg: "Invalid status. Must be 'approved' or 'rejected'." });
  }

  // Find the transaction
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    return res.status(404).json({ msg: "Transaction not found" });
  }

  // If status is rejected, just update the transaction status
  if (status === 'rejected') {
    transaction.status = 'rejected';
    await transaction.save();

    // Find the toUser's wallet (we update the recipient's wallet)
    const wallet = await Wallet.findOne({ user: stockistId }).populate({path: "transactionHistory"});
    if (!wallet) {
      return res.status(404).json({ msg: "Wallet not found for the recipient" });
    }

    const pendingOrRejectedTransactions = await Transaction.find({
      status: { $in: ['pending', 'rejected'] },
      fromUser: stockistId
    });

    return res.status(200).json({ msg: "Transaction has been rejected", wallet , pendingOrRejectedTransactions });
  }

  // If status is approved, update the wallet accordingly
  if (status === 'approved') {
    const { amount, transactionCategory, toUser } = transaction;

    // Find the toUser's wallet (we update the recipient's wallet)
    const wallet = await Wallet.findOne({ user: stockistId }).populate({path: "transactionHistory"});
    if (!wallet) {
      return res.status(404).json({ msg: "Wallet not found for the recipient" });
    }

    // Logic for Balance Transfer (BL)
    if (transactionCategory === 'BL') {
      const maxLockedFund = 3000000; // 30 lakh (3 million)

      // Check if lockedFund has reached 30 lakh
      if (wallet.lockedFund < maxLockedFund) {
        const remainingSpace = maxLockedFund - wallet.lockedFund;

        if (amount <= remainingSpace) {
          // If the amount can fully fit into lockedFund
          wallet.lockedFund += amount;
        } else {
          // If part of the amount goes into lockedFund and the rest into rotationalFund
          wallet.lockedFund = maxLockedFund;
          wallet.rotationalFund += (amount - remainingSpace);
        }
      } else {
        // If lockedFund is already at max, add everything to rotationalFund
        wallet.rotationalFund += amount;
      }
    } else {
      // For ST and CT, add everything to the rotational fund
      wallet.rotationalFund += amount;
    }

    // Add the transaction to the user's transaction history
    wallet.transactionHistory.push(transaction._id);

    // Save the wallet and update the transaction status
    await wallet.save();
    transaction.status = 'approved';
    await transaction.save();



    const pendingOrRejectedTransactions = await Transaction.find({
      status: { $in: ['pending', 'rejected'] },
      fromUser: stockistId
    });

    return res.status(200).json({ 
      message: "Transaction has been approved and wallet updated", 
      transaction, 
      wallet ,
      pendingOrRejectedTransactions
    });
  }


});













// Send Stock from delivery Challan
exports.stockTransferFromAdmin = asyncHandler(async (req, res) => {
  const { products, stockistId, total, deliveryChallanNumber,ewayBillNumber, issueDate } = req.body;

  // Validate the stockist ID
  if (!stockistId) {
    return res.status(401).json({
      message: "Please provide stockist Id",
      success: false
    });
  }

  // Validate the products array
  if (!products || !products.length > 0) {
    return res.status(401).json({
      message: "Please add products!",
      success: false
    });
  }

  // Check if the stockist exists
  const stockist = await User.findOne({ _id: stockistId });

  if (!stockist) {
    return res.status(404).json({
      message: "Stockist not found",
      success: false
    });
  }

  // Check if the stockist's inventory exists
  const inventory = await Inventory.findOne({ stockist: stockist._id });

  if (!inventory) {
    return res.status(404).json({
      message: "Stockist's Inventory Not Found.",
      success: false
    });
  }

  // Create a new delivery challan
  const newDeliveryChallan = await DeliveryChallan.create({
    deliveryChallanNumber,
    total,
    stockist: stockist._id,
    date: issueDate,
    items: products,
    ewayBillNumber
  });



  // Update the stockist's inventory
  for (const product of products) {
    const productDetails = await Product.findById(product.product._id);

    if (!productDetails) {
      return res.status(404).json({
        message: `Product with ID ${product.productId} not found.`,
        success: false
      });
    }

    const inventoryItemIndex = inventory.items.findIndex(
      (item) => item.product.toString() === product.product._id
    );


    if (inventoryItemIndex !== -1) {
      // If the product exists in the stockist's inventory, update the quantity
      inventory.items[inventoryItemIndex].quantity += product.quantity;
    } else {
      // If the product does not exist, add it to the stockist's inventory
      inventory.items.push({
        product: product.product._id,
        quantity: product.quantity
      });
    }
  }

  // Save the updated inventory
  await inventory.save();

  return res.status(200).json({
    message: "Stock transfer and delivery challan creation successful",
    success: true,
    deliveryChallan: newDeliveryChallan
  });
});














