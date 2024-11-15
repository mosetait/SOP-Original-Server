const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const purchaseSchema = new Schema({

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

            billingAmount:{
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


    stockist:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    totalMargin: {
        type: Number,
        required: true
    },

    billNumber: {
        type: String,
        required: true,
        default: "#"
    },

    issueDate: {
        type: Date,
        required: true
    }

}, { timestamps: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
