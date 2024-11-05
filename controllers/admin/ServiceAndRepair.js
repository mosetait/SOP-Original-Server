const DeliveryChallan = require("../../models/DeliveryChallan");
const Category = require("../../models/Category");
const Inventory = require("../../models/Inventory");
const Product = require("../../models/Product");
const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const asyncHandler = require("../../middlewares/asyncHandler");
const ServiceAndRepair = require("../../models/ServiceAndRepair");




// Controller to update the status of an existing service and repair entry

exports.updateServiceAndRepairStatus = asyncHandler( async (req,res) => {

    const { id } = req.params; // Get the service and repair ID from the route params
    const { status } = req.body; // Get the new status from the request body

    // Update the status of the specified document
    const updatedServiceAndRepair = await ServiceAndRepair.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedServiceAndRepair) {
      return res.status(404).json({ message: 'Service and repair record not found' });
    }

    const serviceRequests = await ServiceAndRepair.find()
    .populate({path: "selectedCategory"})
    .populate({path: "selectedProduct"})
    .populate({path: "stockist"})

    return res.status(200).json({
      message: 'Service and repair status updated successfully',
      serviceRequests
    });

})