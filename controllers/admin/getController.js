const DeliveryChallan = require("../../models/DeliveryChallan");
const Category = require("../../models/Category");
const Inventory = require("../../models/Inventory");
const Product = require("../../models/Product");
const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const asyncHandler = require("../../middlewares/asyncHandler");





// Get sales - admin
exports.getDeliveryChallans = asyncHandler(async (req, res) => {
    
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
            }
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