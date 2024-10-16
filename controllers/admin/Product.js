const Product = require("../../models/Product");
const mongoose = require('mongoose');
const Category = require("../../models/Category");



// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            distributorPriceWithoutGST,
            retailerPriceWithoutGST,
            customerPriceWithoutGST,
            mcpWithoutGST,
            distributorPriceWithGST,
            retailerPriceWithGST,
            customerPriceWithGST,
            mcpWithGST,
            category
        } = req.body.product;

        // find category
        const findCategory = await Category.findOne({_id: category});

        if(!findCategory) {
            return res.status(404).json({
                message: "Category not found",
                success: false,
            })
        }

        const product = new Product({
            name,
            distributorPriceWithoutGST: mongoose.Types.Decimal128.fromString(distributorPriceWithoutGST),
            retailerPriceWithoutGST: mongoose.Types.Decimal128.fromString(retailerPriceWithoutGST),
            customerPriceWithoutGST: mongoose.Types.Decimal128.fromString(customerPriceWithoutGST),
            mcpWithoutGST: mongoose.Types.Decimal128.fromString(mcpWithoutGST),
            distributorPriceWithGST: mongoose.Types.Decimal128.fromString(distributorPriceWithGST),
            retailerPriceWithGST: mongoose.Types.Decimal128.fromString(retailerPriceWithGST),
            customerPriceWithGST: mongoose.Types.Decimal128.fromString(customerPriceWithGST),
            mcpWithGST: mongoose.Types.Decimal128.fromString(mcpWithGST),
            category
        });

        await product.save();


        // add product to category
        findCategory.products.push(product._id);
        await findCategory.save();


        const categories = await Category.find().populate('products'); // Populating product details

        res.status(201).json({product ,categories, message: "Product created successfully"});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};




// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category'); // Populating category details
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// Get a single product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// Update a product by ID
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};




// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};








// -------------------------Category---------------------------

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;

        const category = new Category({
            name: categoryName,
        });

        await category.save();

        const categories = await Category.find().populate('products'); // Populating product details

        res.status(201).json({
            categories,
            message: "Category created successfully",
            success: true
        });
    } 
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};



// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('products'); // Populating product details
        res.status(200).json({categories});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// Get a single category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate('products');
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};





// Update a category by ID
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};




// Delete a category by ID
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // Optionally, you may want to remove category references from associated products
        await Product.updateMany({ category: req.params.id }, { $unset: { category: "" } });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



