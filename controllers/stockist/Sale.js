const Category = require("../../models/Category");
const DeliveryChallan = require("../../models/DeliveryChallan");
const Inventory = require("../../models/Inventory");
const Product = require("../../models/Product");
const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const asyncHandler = require("../../middlewares/asyncHandler");
const ExpenseOwnedByCompany = require("../../models/ExpenseOwnedByCompany")
const Sale = require("../../models/Sale");





// create Sale
exports.createSale = asyncHandler(async (req, res) => {

    const { products, total, billNumber, issueDate, clientDetails } = req.body;

    // Find the stockist's inventory
    const inventory = await Inventory.findOne({ stockist: req.user.id });
    if (!inventory) {
        return res.status(404).json({
            message: "Inventory Not found",
            success: false
        });
    }

    // Check if products are available in the inventory and have sufficient quantity
    for (let { product, quantity } of products) {
        const inventoryItem = inventory.items.find(item => item.product.toString() === product._id.toString());

        if (!inventoryItem) {
            return res.status(400).json({
                message: `Product ${product.name} not found in inventory.`,
                success: false
            });
        }

        if (inventoryItem.quantity < quantity) {
            return res.status(400).json({
                message: `Insufficient quantity for product ${product.name}. Available: ${inventoryItem.quantity}, Required: ${quantity}`,
                success: false
            });
        }
    }
  
    // Calculate items array with basePrice, margin, and total for each product
    const items = products.map(({ product, quantity, price, gst }) => {
        const basePrice = price / (1 + gst / 100);  // Calculate base price by removing GST from price
        const margin = basePrice * 0.1;  // Assuming a 10% margin on the base price
        const itemTotal = price * quantity;

        return {
            product: product._id,
            basePrice,
            margin,
            gst,
            quantity,
            total: itemTotal,
        };
    });

    // Calculate total GST for the sale
    const totalGST = items.reduce((acc, item) => {
        const gstAmount = item.total * (item.gst / (100 + item.gst));
        return acc + gstAmount;
    }, 0);

    // Calculate total margin
    const totalMargin = items.reduce((acc, item) => acc + item.margin * item.quantity, 0);

    // Calculate total amount without GST
    const totalWithoutGST = items.reduce((acc, item) => acc + (item.basePrice * item.quantity), 0);

    // Find stockist's wallet
    const stockistWallet = await Wallet.findOne({ user: req.user.id });
    if (!stockistWallet) {
        return res.status(404).json({
            message: "Stockist Wallet Not Found.",
            success: false
        });
    }

    // Deduct amount from stockist funds
    stockistWallet.fund -= totalWithoutGST;

    // Deduct quantity from inventory for each product
    products.forEach(({ product, quantity }) => {
        const inventoryItem = inventory.items.find(item => item.product.toString() === product._id.toString());
        inventoryItem.quantity -= quantity;
    });

    // Save the updated inventory
    await inventory.save();

    // Create sale document
    const sale = new Sale({
        items,
        finalAmount: total,
        totalGST,
        stockist: req.user.id,
        totalMargin,
        clientDetails,
        billNumber,
        issueDate,
        totalWithoutGST,
        fundInWalletBeforeDeduction: stockistWallet.fund + totalWithoutGST // Original fund amount before deduction
    });

    // Save sale document and stockist wallet to database
    await sale.save();
    await stockistWallet.save();

    // Populate the response with relevant details
    const sales = await Sale.find({ stockist: req.user.id })
        .populate({
            path: 'items.product',
            model: 'Product'
        })
        .populate({
            path: 'stockist',
            model: 'User'
        });

    res.status(201).json({
        message: "Sale created successfully",
        success: true,
        sales,
        stockistWallet
    });
});





exports.getStockistSales = asyncHandler( async (req,res) => {

    
    const sales = await Sale.find({ stockist: req.user.id })
    .populate({
        path: 'items.product', // Populate product details in each item
        model: 'Product'
    })
    .populate({
        path: 'stockist', // Populate stockist details
        model: 'User'
    });

    const stockistWallet = await Wallet.findOne({user: req.user.id});


    return res.status(200).json({
        message: "Sales fetched successfully",
        success: true,
        sales,
        stockistWallet
    })


})