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
const Purchase = require("../../models/Purchase");
const mongoose = require("mongoose");





// Function to create purchase immediately after a sale
async function createPurchaseAfterSale(sale) {
    // Map items with the new calculations for billingAmount and total
    const purchaseItems = sale.items.map(item => {
        const billingAmount = item.basePrice - item.margin; // Billing amount = Base price - Margin
        const total = billingAmount * item.quantity; // Total = Billing amount * Quantity

        return {
            product: item.product,
            basePrice: item.basePrice,
            margin: item.margin,
            gst: item.gst,
            quantity: item.quantity,
            billingAmount, // Base price - Margin
            total, // Billing amount * Quantity
        };
    });

    // Calculate finalAmount as the sum of total for all products
    const finalAmount = purchaseItems.reduce((sum, item) => sum + item.total, 0);

    // Create and save the Purchase
    const purchase = new Purchase({
        items: purchaseItems,
        finalAmount, // Sum of all totals
        stockist: sale.stockist,
        totalMargin: sale.totalMargin,
        issueDate: sale.issueDate,
        billNumber: sale.billNumber, // Optionally link bill numbers
    });

    await purchase.save();
}





// createSale controller
exports.createSale = asyncHandler(async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { products, total, billNumber, issueDate, clientDetails, clientType } = req.body;

        // Find the stockist's inventory
        const inventory = await Inventory.findOne({ stockist: req.user.id }).session(session);
        if (!inventory) {
            await session.abortTransaction();
            return res.status(404).json({
                message: "Inventory Not found",
                success: false
            });
        }

        // Check if products are available in the inventory and have sufficient quantity
        for (let { product, quantity } of products) {
            const inventoryItem = inventory.items.find(item => item.product.toString() === product._id.toString());

            if (!inventoryItem) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Product ${product.name} not found in inventory.`,
                    success: false
                });
            }

            if (inventoryItem.quantity < quantity) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Insufficient quantity for product ${product.name}. Available: ${inventoryItem.quantity}, Required: ${quantity}`,
                    success: false
                });
            }
        }

        // Calculate items array with basePrice, margin, and total for each product
        const items = products.map(({ product, quantity, price, gst }) => {
            const basePrice = price / (1 + gst / 100);
            const margin = basePrice - (basePrice / 1.10);
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

        // Calculate total GST, margin, and amount without GST
        const totalGST = items.reduce((acc, item) => acc + item.total * (item.gst / (100 + item.gst)), 0);
        const totalMargin = items.reduce((acc, item) => acc + item.margin * item.quantity, 0);
        const totalWithoutGST = items.reduce((acc, item) => acc + (item.basePrice * item.quantity), 0);

        // Update stockist's wallet and inventory
        const stockistWallet = await Wallet.findOne({ user: req.user.id }).session(session);
        if (!stockistWallet) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Stockist Wallet Not Found.", success: false });
        }
        stockistWallet.fund -= totalWithoutGST;

        products.forEach(({ product, quantity }) => {
            const inventoryItem = inventory.items.find(item => item.product.toString() === product._id.toString());
            inventoryItem.quantity -= quantity;
        });
        await inventory.save({ session });

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
            client: clientType,
            fundInWalletBeforeDeduction: stockistWallet.fund + totalWithoutGST
        });

        await sale.save({ session });
        await stockistWallet.save({ session });

        // Call function to create purchase
        await createPurchaseAfterSale(sale);

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Populate the response
        const sales = await Sale.find({ stockist: req.user.id })
            .populate({ path: 'items.product', model: 'Product' })
            .populate({ path: 'stockist', model: 'User' });

        res.status(201).json({
            message: "Sale created successfully",
            success: true,
            sales,
            stockistWallet
        });
    } catch (error) {
        // Abort the transaction on error
        console.log(error)
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            message: "An error occurred while creating the sale",
            success: false,
            error: error.message
        });
    }
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