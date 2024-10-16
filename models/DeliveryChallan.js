const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const deliveryChallanSchema = new Schema({

    deliveryChallanNumber: {
        type: String,
        required: true
    },

    stockist:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    items:[
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "Product"
            },
            price:{
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],

    total:{
        type: String,
        required: true
    },

    date: {
        type: Date,
        required: true
    }




}, { timestamps: true });

const DeliveryChallan = mongoose.model('DeliveryChallan', deliveryChallanSchema);

module.exports = DeliveryChallan;
