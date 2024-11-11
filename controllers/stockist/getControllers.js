const Category = require("../../models/Category");
const DeliveryChallan = require("../../models/DeliveryChallan");
const Inventory = require("../../models/Inventory");
const Product = require("../../models/Product");
const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const asyncHandler = require("../../middlewares/asyncHandler");
const ExpenseOwnedByCompany = require("../../models/ExpenseOwnedByCompany")



// get delivery challans for stockist
exports.getDeliveryChallansForStockist = asyncHandler(async (req, res) => {
    
    const { month, year } = req.body.formattedDate;

    // Validate input
    if (!month) {
        return res.status(401).json({
            message: "Provide month",
            success: false
        });
    }

    if (!year) {
        return res.status(401).json({
            message: "Provide year",
            success: false
        });
    }

    // Create the start and end date range for the query
    const startDate = new Date(year, month - 1, 1); // Month is 0-indexed, so subtract 1
    const endDate = new Date(year, month, 0); // This gets the last day of the month

    try {
        // Fetch delivery challans within the date range
        const deliveryChallans = await DeliveryChallan.find({
            date: {
                $gte: startDate,
                $lt: endDate
            },
            stockist: req.user._id
        })
        .populate('stockist', 'name email') // Populate stockist with name and email
        .populate('items.product', 'name'); // Populate product name in items array

        if (!deliveryChallans.length) {
            return res.status(404).json({
                message: "No delivery challans found for the specified month and year",
                success: false
            });
        }

        // Return the found delivery challans
        return res.status(200).json({
            message: "Delivery challans fetched successfully",
            success: true,
            deliveryChallans
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
});





// fetch inventory
exports.fetchInventory = asyncHandler( async (req,res) => {

    const inventory = await Inventory.findOne({ stockist: req.user.id })
    .populate({
        path: "items.product",      // Populate the product in each inventory item
        populate: {
            path: "category",        // Populate the category within each product
            model: "Category"
        }
    });


    return res.status(200).json({
        message: "Inventory Fetched Successfully",
        inventory
    })

})




// fetch all expenses with all stockists
exports.fetchAllExpensesStockist = asyncHandler(async (req, res) => {
    const { month, year } = req.query;

    // Build a filter object based on provided month, year, and the logged-in stockist's ID
    const filter = { stockist: req.user.id };
    if (month) filter.month = month;
    if (year) filter.year = year;

    try {
        // Fetch expenses with the month, year, and stockist filter, and populate the stockist field
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


