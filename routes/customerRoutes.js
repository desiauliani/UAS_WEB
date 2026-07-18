const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { isLogin, isCustomer } = require('../middleware/authMiddleware');

// Halaman Publik
router.get('/', customerController.homePage);
router.get('/catalog', customerController.catalogPage);
router.get('/product/:id', customerController.productDetail);
router.get('/profile', customerController.profilePage);

// Fitur Keranjang (Memanfaatkan Session, tidak masuk DB dulu)
router.post('/cart/add/:id', customerController.addToCart);
router.get('/cart', customerController.cartPage);
router.post('/cart/update/:id', customerController.updateCart);
router.get('/cart/delete/:id', customerController.deleteCart);

// Fitur Customer (Wajib Login)
router.get('/profile', isLogin, isCustomer, customerController.profilePage);
router.post('/profile/update', isLogin, isCustomer, customerController.updateProfile);
router.post('/review/add/:productId', isLogin, isCustomer, customerController.addReview);

module.exports = router;

