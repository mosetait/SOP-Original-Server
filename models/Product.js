const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create the Product schema
const productSchema = new Schema({

    name: {
        type: String,
        required: true
    },

    distributorPriceWithoutGST: {
        type: Schema.Types.Decimal128,
        required: true
    },

    retailerPriceWithoutGST: {
        type: Schema.Types.Decimal128,
        required: true
    },

    customerPriceWithoutGST: {
        type: Schema.Types.Decimal128,
        required: true
    },

    mcpWithoutGST: {
        type: Schema.Types.Decimal128,
        required: true
    },

    distributorPriceWithGST: {
        type: Schema.Types.Decimal128,
        required: true
    },

    retailerPriceWithGST: {
        type: Schema.Types.Decimal128,
        required: true
    },

    customerPriceWithGST: {
        type: Schema.Types.Decimal128,
        required: true
    },

    mcpWithGST: {
        type: Schema.Types.Decimal128,
        required: true
    },

    category:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Category"
    }

}, { timestamps: true });

// Create the Product model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
