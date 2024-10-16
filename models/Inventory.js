const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const inventorySchema = new Schema({


    stockist: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity:{
                type: Number
            }
        }
    ],

    
    
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
