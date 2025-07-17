const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcrypt');

const useRedis = false;

const PROFILE_TTL = 300; // 5dk
const profileKey = (userId) => `profile:${userId}`;
const redis = useRedis ? require('../config/redis').redis : null;

exports.getUserProfile = async (req, res) => {
    try {
        if (useRedis) {
            const cached = await redis.get(profileKey(req.userId));
            if (cached) {
                const profile = JSON.parse(cached);
                return res.json({ profile, message: 'redis data' });
            }
        }

        const user = await User.findById(req.userId).select('fullname role');
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        const profile = { fullname: user.fullname, role: user.role };

        if (useRedis) {
            await redis?.setEx(
                profileKey(req.userId),
                PROFILE_TTL,
                JSON.stringify(profile)
            );

            res.json({ profile, message: 'mongodb data' });
        } else {
            res.json(profile);
        }
    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

exports.getFullUserData = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası', detail: err.message });
    }
};

exports.updateFullname = async (req, res) => {
    const { fullname } = req.body;

    if (!fullname || fullname.trim() === '') {
        return res.status(400).json({ error: 'Ad soyad boş olamaz' });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { fullname },
            { new: true }
        ).select('fullname');

        if (!updatedUser) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({
            message: 'Ad soyad güncellendi',
            fullname: updatedUser.fullname,
        });
    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

exports.updateEmail = async (req, res) => {
    const { newEmail, currentPassword } = req.body;

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Şifre yanlış' });
        }

        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) {
            return res
                .status(400)
                .json({ error: 'Bu email zaten kullanılıyor' });
        }

        user.email = newEmail;
        await user.save();

        res.json({ message: 'Email başarıyla güncellendi' });
    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası', detail: err.message });
    }
};

exports.updatePhoneNumber = async (req, res) => {
    const { newPhoneNumber, currentPassword } = req.body;

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Şifre yanlış' });
        }

        user.phoneNumber = newPhoneNumber;
        await user.save();

        res.json({ message: 'Telefon numarası başarıyla güncellendi' });
    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası', detail: err.message });
    }
};

exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Mevcut şifre yanlış' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Şifre başarıyla güncellendi' });
    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası', detail: err.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.userId,
            { isDeleted: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({ message: 'Hesap başarıyla silindi.' });
    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası', detail: err.message });
    }
};

exports.addToFavorites = async (req, res) => {
    const { productId } = req.params;

    try {
        const user = await User.findById(req.userId);

        if (!user.favorites.includes(productId)) {
            user.favorites.push(productId);
            await user.save();
        }

        res.status(200).json({ message: 'Ürün favorilere eklendi.' });
    } catch (err) {
        res.status(500).json({ error: 'Favorilere ekleme işlemi başarısız.' });
    }
};

exports.removeFromFavorites = async (req, res) => {
    const { productId } = req.params;

    try {
        const user = await User.findById(req.userId);

        user.favorites = user.favorites.filter(
            (favId) => favId.toString() !== productId
        );

        await user.save();

        res.status(200).json({ message: 'Ürün favorilerden kaldırıldı.' });
    } catch (err) {
        res.status(500).json({
            error: 'Favorilerden çıkarma işlemi başarısız.',
        });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('favorites');
        res.status(200).json({ favorites: user.favorites });
    } catch (err) {
        res.status(500).json({ error: 'Favoriler alınamadı.' });
    }
};

exports.addOrUpdateCartItem = async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const userId = req.userId;

    try {
        const user = await User.findById(userId);

        const existingItem = user.cart.find(
            (item) => item.product.toString() === productId
        );

        const product = await Product.findById(productId);

        const fixedQuantity =
            quantity <= 0
                ? 1
                : quantity > product.stock
                ? product.stock
                : quantity;

        if (existingItem) {
            existingItem.quantity = fixedQuantity;
        } else {
            user.cart.push({ product: productId, quantity: fixedQuantity });
        }

        await user.save();
        res.status(200).json({ success: true, cart: user.cart });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Sepet güncellenirken hata oluştu.',
        });
    }
};

exports.removeCartItem = async (req, res) => {
    const { productId } = req.params;
    const userId = req.userId;

    try {
        await User.findByIdAndUpdate(userId, {
            $pull: { cart: { product: productId } },
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Sepetten silinemedi.' });
    }
};

exports.getCart = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId).populate('cart.product');
        res.status(200).json({ success: true, cart: user.cart });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Sepet getirilemedi.' });
    }
};

exports.getUserFullnameAndPhoneNumber = async (req, res) => {
    const userId = req.userId;
    const searchedUserId = req.query.searchedUserId;

    if (!searchedUserId) {
        return res
            .status(400)
            .json({ error: 'searchedUserId parametresi gerekli' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        const searchedUser = await User.findById(searchedUserId);
        if (!searchedUser) {
            return res
                .status(404)
                .json({ error: 'Aranan kullanıcı bulunamadı' });
        }

        res.status(200).json({
            success: true,
            fullname: searchedUser.fullname,
            phoneNumber: searchedUser.phoneNumber,
        });
    } catch (error) {
        console.error('Kullanıcı adı getirilemedi:', error);
        res.status(500).json({
            success: false,
            error: 'Kullanıcı adı getirilemedi.',
        });
    }
};
