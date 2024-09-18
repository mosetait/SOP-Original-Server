const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lockedFund: {
    type: Number,
    default: 0
  },
  rotationalFund: {
    type: Number,
    default: 0
  },
  transactionHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
