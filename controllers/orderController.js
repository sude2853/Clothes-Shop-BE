const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

exports.createOrder = async (req, res) => {
    const { address, cardInfo, items, totalPrice } = req.body;

    try {
        const populatedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: `Ürün bulunamadı: ${item.productId}`,
                });
            }

            populatedItems.push({
                productId: item.productId,
                title: product.title,
                image1: product.image1,
                image2: product.image2,
                price: product.price,
                quantity: item.quantity,
                discount: product.discount,
                deliveryStatus: 'Hazırlanıyor',
            });

            product.stock = product.stock - item.quantity;
            await product.save();
        }

        const orderNumber = generateOrderNumber();

        const newOrder = await Order.create({
            userId: req.userId,
            address,
            cardInfo,
            totalPrice,
            items: populatedItems,
            orderNumber,
        });

        await User.findByIdAndUpdate(req.userId, { cart: [] });

        res.status(201).json({ success: true, data: newOrder });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Sipariş oluşturulurken bir hata oluştu.',
        });
    }
};
