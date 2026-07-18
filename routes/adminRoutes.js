const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController'); 
const adminProductController = require('../controllers/adminProductController'); 
const { isLogin, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Middleware proteksi admin (semua route di bawah ini perlu login admin)
router.use(isLogin, isAdmin);

// Dashboard
router.get('/dashboard', adminController.dashboard);

// CRUD Category
router.get('/categories', adminController.categoryList);
router.post('/categories', adminController.categoryAdd);
router.put('/categories/:id', adminController.categoryUpdate);
router.delete('/categories/:id', adminController.categoryDelete);

// CRUD Product (Semua menggunakan /products)
router.get('/products', adminProductController.index);             // Daftar produk
router.post('/products', upload.single('gambar'), adminProductController.store); // Simpan produk
router.get('/products/edit/:id', adminProductController.editPage); // Halaman edit
router.put('/products/:id', upload.single('gambar'), adminProductController.update); // Update produk
router.delete('/products/:id', adminProductController.delete);      // Hapus produk

// Manajemen Order
router.get('/orders', adminController.orderList);
router.get('/orders/:id', adminController.orderDetail);
router.put('/orders/:id/status', adminController.orderUpdateStatus);

// Manajemen Users & Reviews
router.get('/users', adminController.userList);
router.delete('/users/:id', adminController.userDelete);
router.get('/reviews', adminController.reviewList);
router.delete('/reviews/:id', adminController.reviewDelete);

module.exports = router;