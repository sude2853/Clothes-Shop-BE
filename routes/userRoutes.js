const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.get('/me', verifyToken, userController.getUserProfile);
router.get('/account', verifyToken, userController.getFullUserData);
router.get('/favorites', verifyToken, userController.getFavorites);
router.get('/cart', verifyToken, userController.getCart);
router.post('/cart', verifyToken, userController.addOrUpdateCartItem);
router.post(
    '/favorites/:productId',
    verifyToken,
    userController.addToFavorites
);
router.delete('/delete-account', verifyToken, userController.deleteAccount);
router.delete(
    '/favorites/:productId',
    verifyToken,
    userController.removeFromFavorites
);
router.delete('/cart/:productId', verifyToken, userController.removeCartItem);

module.exports = router;
