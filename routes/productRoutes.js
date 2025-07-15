const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/id/:id', productController.getProductById);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/color/:color', productController.getProductsByColor);
router.get('/size/:size', productController.getProductsBySize);
router.get('/search', productController.findProducts);
router.get('/filter', productController.filterProducts);
router.put('/:id', verifyToken, productController.updateProduct);
router.post('/', verifyToken, productController.addProduct);
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;
