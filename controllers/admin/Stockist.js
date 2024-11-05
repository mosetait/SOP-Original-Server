const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const asyncHandler = require("../../middlewares/asyncHandler");
const ExpenseOwnedByCompany = require('../../models/ExpenseOwnedByCompany');
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








// create expense owned by company 
exports.createExpense = asyncHandler(async (req, res) => {

    const { expenses, month, year, stockist } = req.body.formData;


    // Check if all required fields are provided
    if (!expenses || !month || !year || !stockist) {
        return res.status(400).json({
            message: "Please provide all fields.",
            success: false
        });
    }

    // Validate expenses array
    if (!Array.isArray(expenses) || expenses.length === 0) {
        return res.status(400).json({
            message: "Expenses should be a non-empty array.",
            success: false
        });
    }

    // Ensure each expense item has 'type' and 'amount'
    for (const expense of expenses) {
        if (!expense.type || !expense.amount) {
            return res.status(400).json({
                message: "Each expense must include 'type' and 'amount'.",
                success: false
            });
        }
    }

    try {
        // Create the new expense record
        const newExpense = await ExpenseOwnedByCompany.create({
            expenses,
            month,
            year,
            stockist
        });

        res.status(201).json({
            message: "Expense created successfully.",
            success: true,
            data: newExpense
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create expense.",
            success: false,
            error: error.message
        });
    }
});




// fetch all expenses with all stockists
exports.fetchAllExpenses = asyncHandler(async (req, res) => {
    const { month, year } = req.query;

    // Build a filter object based on provided month and year
    const filter = {};
    if (month) filter.month = month;
    if (year) filter.year = year;

    try {
        // Fetch expenses with the optional month and year filter, and populate the stockist field
        const expenses = await ExpenseOwnedByCompany.find(filter).populate({ path: "stockist" });

        // Return the found expenses
        return res.status(200).json({
            message: "Expenses retrieved successfully.",
            success: true,
            expenses
        });
    } 
    catch (error) {
        // Handle any errors that occur during fetching
        return res.status(500).json({
            message: "Failed to fetch expenses.",
            success: false,
            error: error.message
        });
    }
});




exports.updateExpense = asyncHandler(async (req, res) => {
    

    const { id } = req.params; // ID of the expense record to update
    const { expenses, month, year, stockist } = req.body;

    // Check if all required fields are provided
    if (!expenses || !month || !year || !stockist) {
        return res.status(400).json({
            message: "Please provide all fields.",
            success: false
        });
    }

    // Validate expenses array
    if (!Array.isArray(expenses) || expenses.length === 0) {
        return res.status(400).json({
            message: "Expenses should be a non-empty array.",
            success: false
        });
    }

    // Ensure each expense item has 'type' and 'amount'
    for (const expense of expenses) {
        if (!expense.type || !expense.amount) {
            return res.status(400).json({
                message: "Each expense must include 'type' and 'amount'.",
                success: false
            });
        }
    }

    try {
        // Find the expense record by ID
        const expenseRecord = await ExpenseOwnedByCompany.findById(id);
        if (!expenseRecord) {
            return res.status(404).json({
                message: "Expense not found.",
                success: false
            });
        }

        // Update the expense record
        expenseRecord.expenses = expenses;
        expenseRecord.month = month;
        expenseRecord.year = year;
        expenseRecord.stockist = stockist._id;

        // Save the updated expense record
        await expenseRecord.save();

        res.status(200).json({
            message: "Expense updated successfully.",
            success: true,
            data: expenseRecord
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update expense.",
            success: false,
            error: error.message
        });
    }
});
