const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

router.post('/', verifyToken, orderController.createOrder);

module.exports = router;
