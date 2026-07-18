const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { isLogin, isCustomer } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Wajib login sebagai customer
router.use(isLogin, isCustomer);

// Halaman Checkout Ala Shopee & Pemrosesan
router.get('/checkout', orderController.checkoutPage);
router.post('/checkout', upload.single('bukti_bayar'), orderController.processCheckout);

// Riwayat Pesanan
router.get('/history', orderController.orderHistory);
router.get('/detail/:id', orderController.orderDetail);

module.exports = router;