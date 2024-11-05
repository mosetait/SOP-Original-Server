const Category = require("../../models/Category");
const DeliveryChallan = require("../../models/DeliveryChallan");
const Inventory = require("../../models/Inventory");
const Product = require("../../models/Product");
const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const asyncHandler = require("../../middlewares/asyncHandler");
const ExpenseOwnedByCompany = require("../../models/ExpenseOwnedByCompany");
const ServiceAndRepair = require("../../models/ServiceAndRepair");






// create service
exports.createServiceAndRepair = asyncHandler( async (req,res) => {

    const { clientDetails, selectedCategory, selectedProduct } = req.body;

    // Create a new document in the ServiceAndRepair collection
    const newServiceAndRepair = new ServiceAndRepair({
      clientDetails,
      selectedCategory,
      selectedProduct,
      stockist: req.user.id
    });

    await newServiceAndRepair.save(); // Save the new document to the database

    const serviceRequests = await ServiceAndRepair.find({ stockist: req.user.id });


    return res.status(201).json({
      message: 'Service and repair record created successfully',
      serviceRequests
    });

})






// fetch service requests
exports.fetchServiceRequests = asyncHandler( async (req,res) => {

  const serviceRequests = await ServiceAndRepair.find({ stockist: req.user.id })
  .populate({path: "selectedCategory"})
  .populate({path: "selectedProduct"});

  return res.status(200).json({
    message: "Service Requests fetched successfully",
    success: true,
    serviceRequests
  })

})