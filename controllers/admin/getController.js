const DeliveryChallan = require("../../models/DeliveryChallan");
const Category = require("../../models/Category");
const Inventory = require("../../models/Inventory");
const Product = require("../../models/Product");
const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const asyncHandler = require("../../middlewares/asyncHandler");
const Sale = require("../../models/Sale");
const ServiceAndRepair = require("../../models/ServiceAndRepair");





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




// fetch service requests
exports.fetchServiceRequestsAdmin = asyncHandler( async (req,res) => {

    const serviceRequests = await ServiceAndRepair.find()
    .populate({path: "selectedCategory"})
    .populate({path: "selectedProduct"})
    .populate({path: "stockist"})
  
    return res.status(200).json({
      message: "Service Requests fetched successfully",
      success: true,
      serviceRequests
    })
  
})






// fetch service requests
exports.fetchInventoryAdmin = asyncHandler( async (req,res) => {

    const {id} = req.params;
 
    const inventory = await Inventory.findOne({ stockist: id })
    .populate({ path: "items.product" });

    return res.status(200).json({
        message: "Inventory Fetched Successfully",
        inventory
    })
  
})










// Helper function to convert month name to date
const monthToDate = (monthName, year = new Date().getFullYear()) => {
    const monthIndex = new Date(Date.parse(monthName + " 1, " + year)).getMonth();
    return new Date(year, monthIndex, 1);
};



// calculate commission
exports.calculateCommission = asyncHandler(async (req, res) => {
    const {
        selectedStockist,
        commissionType,
        selectedMonth,
        quarterStartMonth,
        quarterEndMonth
    } = req.body;

    // find the stockist
    const stockist = await User.findOne({ _id: selectedStockist });

    if (!stockist) {
        return res.status(404).json({
            message: "Stockist Not found"
        });
    }

    // Define the query object
    let query = { stockist: selectedStockist };

    let expectedCommission = 0;


    // Filter sales based on the commission type
    if (commissionType === "monthly") {
        // Convert selected month to date range
        const startOfMonth = monthToDate(selectedMonth);
        const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

        expectedCommission = 60000;

        query.issueDate = {
            $gte: startOfMonth,
            $lte: endOfMonth
        };

    } else if (commissionType === "quarterly") {
        // Convert quarter start and end months to date range
        const startOfQuarter = monthToDate(quarterStartMonth);
        const endOfQuarter = new Date(monthToDate(quarterEndMonth).getFullYear(), monthToDate(quarterEndMonth).getMonth() + 1, 0);

        expectedCommission = 60000 * 4;

        query.issueDate = {
            $gte: startOfQuarter,
            $lte: endOfQuarter
        };
    }

    // Fetch all sales based on the defined query
    const sales = await Sale.find(query)
    .populate({
        path: 'items.product', // Populate product details in each item
        model: 'Product'
    })
    .populate({
        path: 'stockist', // Populate stockist details
        model: 'User'
    });

    // Calculate the commission value from base prices
    let commissionTotal = 0;

    sales.forEach(sale => {
        sale.items.forEach(item => {
            const itemCommission = item.margin * item.quantity;
            commissionTotal += itemCommission;
        });
    });



    // Return the sales data in response
    return res.status(200).json({
        message: "Sales fetched successfully",
        sales,
        commissionTotal,
        expectedCommission
    });
});