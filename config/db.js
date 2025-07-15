const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        await mongoose.connect(MONGO_URI, {});
        const now = new Date();
        const time = now.toLocaleString('tr-TR');
        console.log(`${time}\tMongoDB bağlantısı başarılı`);
    } catch (error) {
        const now = new Date();
        const time = now.toLocaleString('tr-TR');
        console.error(`${time}\tMongoDB bağlantı hatası:`, error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
