const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const BASE_ENDPOINT = '/api/v1';

app.use(`${BASE_ENDPOINT}/auth`, authRoutes);
app.use(`${BASE_ENDPOINT}/user`, userRoutes);
app.use(`${BASE_ENDPOINT}/products`, productRoutes);
app.use(`${BASE_ENDPOINT}/orders`, orderRoutes);

app.get(BASE_ENDPOINT, (req, res) => {
    res.json({ message: 'Welcome to the ClothesShop App API!' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        const now = new Date();
        const time = now.toLocaleString('tr-TR');
        console.log(`${time}\tSunucu ${PORT} portunda çalışıyor...`);
    });
});
