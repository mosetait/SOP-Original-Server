const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const transactionSchema = new Schema({

  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to either admin or stockist
    required: true
  },

  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to either admin or stockist
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  transactionType: {
    type: String,
    enum: ['debit', 'credit'], // Debit (admin debits stockist), Credit (admin credits stockist)
    required: true
  },

  transactionCategory: {
    type: String,
    enum: ['BL', 'ST', 'CT'], // BL = Balance Transfer, ST = Stock Transfer, CT = Client Transfer
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  proof: {
    publicId: {
      type: String,
      required: true
    },
    secureUrl: {
      type: String,
      required: true
    }
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  transactionDate:{
    type: Date,
    required: true
  }

}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
