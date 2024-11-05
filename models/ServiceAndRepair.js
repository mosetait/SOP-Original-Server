const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serviceAndRepairSchema = new Schema({

  clientDetails: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      match: /.+\@.+\..+/ // Basic regex for email validation
    },
    notes: {
      type: String,
      default: '' // Optional field
    }
  },

  selectedCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Category', // Assuming you have a 'Category' model
    required: true
  },

  selectedProduct: {
    type: Schema.Types.ObjectId,
    ref: 'Product', // Assuming you have a 'Product' model
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'], // Example status options
    default: 'pending'
  },

  stockist:{
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }

}, { timestamps: true });

const ServiceAndRepair = mongoose.model('ServiceAndRepair', serviceAndRepairSchema);

module.exports = ServiceAndRepair;
