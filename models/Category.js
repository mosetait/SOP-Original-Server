const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Create the Product schema
const categorySchema = new Schema({

    name: {
        type: String,
        required: true
    },

    products:{
        type:[mongoose.Schema.Types.ObjectId],
        ref: "Product"
    },

    
}, { timestamps: true });

// Create the Category model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
