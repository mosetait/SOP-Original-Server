const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseOwnedByCompanySchema = new Schema({
    
    expenses: [{
        type: {
            type: String, // e.g., "ASMSalary", "transportationCost", etc.
            required: true
        },
        amount: {
            type: Schema.Types.Decimal128,
            required: true
        }
    }],
    
    month: {
        type: String,
        required: true
    },

    year: {
        type: String,
        required: true
    },

    stockist: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, { timestamps: true });

const ExpenseOwnedByCompany = mongoose.model('ExpenseOwnedByCompany', expenseOwnedByCompanySchema);

module.exports = ExpenseOwnedByCompany;
