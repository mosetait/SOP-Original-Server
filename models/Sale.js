const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const saleSchema = new Schema({

    items:[
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },

            basePrice:{
                type: Number,
                required: true
            },

            margin:{
                type: Number,
                required: true
            },

            gst:{
                type: Number,
                required: true
            },

            quantity: {
                type: Number,
                required: true
            },

            total:{
                type: Number,
                required: true  
            }
        }
    ],

    // Final sale amount after any adjustments
    finalAmount: {
        type: Number,
        required: true
    },

    totalWithoutGST :{
        type: Number,
        required: true
    },

    fundInWalletBeforeDeduction:{
        type: Number,
        required: true
    },

    // GST total for the sale
    totalGST: {
        type: Number,
        required: true
    },


    stockist:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    totalMargin: {
        type: Number,
        required: true
    },

    clientDetails:{
        
        name: {
            type: String,
            required: true
        },

        contactNumber: {
            type: Number,
            required:true
        },

        address: {
            type: String,
            required: true
        }

    },

    billNumber: {
        type: String,
        required: true
    },

    issueDate: {
        type: String,
        required: true
    }

}, { timestamps: true });

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
