const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const asyncHandler = require("../../middlewares/asyncHandler");
const mongoose = require("mongoose")

// Approve or Reject a Transaction
exports.approveOrRejectTransaction = asyncHandler(async (req, res) => {
  const { transactionId, status , stockistId} = req.body;

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
    return res.status(200).json({ msg: "Transaction has been rejected", transaction });
  }

  // If status is approved, update the wallet accordingly
  if (status === 'approved') {
    const { amount, transactionCategory, toUser } = transaction;

    // Find the toUser's wallet (we update the recipient's wallet)
    const wallet = await Wallet.findOne({ user: stockistId });
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

    return res.status(200).json({ msg: "Transaction has been approved and wallet updated", transaction, wallet });
  }
});
