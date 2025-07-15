const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        image1: { type: String },
        image2: { type: String },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        subCategory: { type: String, required: true },
        color: { type: String },
        size: { type: String },
        stock: { type: Number },
        discount: { type: Number },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
