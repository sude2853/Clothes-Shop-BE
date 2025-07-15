const Product = require('../models/Product');

const VALID_CATEGORIES = ['kadin', 'erkek', 'bebek', 'aksesuar'];

const escapeRegExp = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.addProduct = async (req, res) => {
    const data = req.body;
    const category = data.category.toLowerCase();
    const subCategory = data.subCategory.toLowerCase();
    const color = data.color.toLowerCase();
    const size = data.size.toLowerCase();

    const formattedProduct = { ...data, category, subCategory, color, size };

    try {
        const product = await Product.create(formattedProduct);
        res.status(201).json({ message: 'Ürün eklendi', product });
    } catch (err) {
        res.status(500).json({ error: 'Ürün eklenemedi', detail: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Ürünler getirilemedi' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        Object.assign(product, req.body);
        await product.save();

        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Ürün güncellenemedi' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }
        await product.deleteOne();
        res.json({ message: 'Ürün silindi' });
    } catch (err) {
        res.status(500).json({ error: 'Ürün silinemedi' });
    }
};

exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Ürün bulunamadı.' });
        }

        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: 'Ürün getirilirken bir hata oluştu.' });
    }
};

exports.getProductsByCategory = async (req, res) => {
    const category = req.params.category?.toLowerCase();

    if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: 'Geçersiz kategori' });
    }

    try {
        const products = await Product.find({ category }).sort({
            createdAt: -1,
        });

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Ürünler getirilemedi' });
    }
};

exports.getProductsByColor = async (req, res) => {
    const color = req.params.color;

    try {
        const products = await Product.find({ color }).sort({
            createdAt: -1,
        });

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Ürünler getirilemedi' });
    }
};

exports.getProductsBySize = async (req, res) => {
    const size = req.params.size;

    try {
        const products = await Product.find({ size }).sort({
            createdAt: -1,
        });

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Ürünler getirilemedi' });
    }
};

exports.findProducts = async (req, res) => {
    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').toLowerCase().trim();

    if (!search) return res.status(200).json([]);

    const regex = new RegExp(escapeRegExp(search), 'i');

    const query = {
        $or: [{ title: regex }, { description: regex }],
    };

    if (category) {
        query.category = category;
    }

    try {
        const products = await Product.find(query).sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: 'Ürünler getirilemedi' });
    }
};

exports.filterProducts = async (req, res) => {
    const category = (req.query.category || '').toLowerCase();
    const subCategory = (req.query.subCategory || '').toLowerCase();
    const color = (req.query.color || '').toLowerCase();
    const size = (req.query.size || '').toLowerCase();

    const query = {};

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (color) query.color = color;
    if (size) query.size = size;

    try {
        const products = await Product.find(query).sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: 'Ürünler getirilemedi' });
    }
};
