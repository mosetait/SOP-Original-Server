const Transaction = require("../../models/Transaction");
const Wallet = require("../../models/Wallet")
const asyncHandler = require("../../middlewares/asyncHandler");
const { uploadImageToCloudinary } = require("../../utils/imageUploader");



// Create a new transaction
exports.BalanceTransferStockist = asyncHandler(async (req, res) => {

  const { fromUser, toUser, amount, transactionType, transactionCategory, description } = req.body;

  // Validate input fields
  if (!fromUser || !toUser || !amount || !transactionType || !transactionCategory) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  // Validate transaction category
  const validCategories = ['BL'];
  if (!validCategories.includes(transactionCategory)) {
    return res.status(400).json({ message: "Invalid transaction category" });
  }

  // Upload proof of transaction to Cloudinary
  let proof = {};
  if (req.files && req.files.proof) {
    const file = req.files.proof;
    const cloudinaryResult = await uploadImageToCloudinary(file, 'transaction_proofs');
    proof = {
      publicId: cloudinaryResult.public_id,
      secureUrl: cloudinaryResult.secure_url
    };
  } else {
    return res.status(400).json({ message: "Please provide proof of transaction" });
  }

  // Create new transaction
  const transaction = new Transaction({
    fromUser,
    toUser,
    amount,
    transactionType,
    transactionCategory,
    description,
    proof
  });

  await transaction.save();

  const wallet = await Wallet.find()
                      .populate({path: "transactionHistory"});

  const pendingOrRejectedTransactions = await Transaction.find({
    status: { $in: ['pending', 'rejected'] }
  });

  res.status(201).json({transaction , wallet , pendingOrRejectedTransactions});
});
