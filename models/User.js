const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer',
        },
        isDeleted: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        otp: { type: String },
        otpExpiresAt: { type: Date },
        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        cart: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
