const db = require('../models');
const fs = require('fs');
const path = require('path');
const { Product, Category, User, Order, Review, OrderDetail } = db;

// --- DASHBOARD ---
exports.dashboard = async (req, res) => {
    try {
        const countUsers = await User.count({ where: { role: 'customer' } });
        const countProducts = await Product.count();
        const countOrders = await Order.count();
        const totalRevenue = await Order.sum('total', { where: { status: 'Selesai' } });

        const recentOrders = await Order.findAll({
            include: [{ model: User, as: 'user', attributes: ['nama'] }],
            limit: 5, order: [['createdAt', 'DESC']]
        });

        res.render('admin/dashboard', { 
            title: 'Admin Dashboard', 
            countUsers, countProducts, countOrders, 
            totalRevenue: totalRevenue || 0, 
            recentOrders 
        });
    } catch (err) {
        console.error("Dashboard Error:", err);
        req.flash('error', 'Gagal memuat dashboard');
        res.redirect('/admin');
    }
};

// --- CATEGORY CRUD ---
exports.categoryList = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.render('admin/categories', { title: 'Kelola Kategori', categories });
    } catch (err) {
        req.flash('error', 'Gagal memuat kategori');
        res.redirect('/admin');
    }
};

exports.categoryAdd = async (req, res) => {
    try {
        await Category.create({ nama: req.body.nama });
        req.flash('success', 'Kategori ditambahkan!');
    } catch (err) {
        req.flash('error', 'Gagal menambah kategori');
    }
    res.redirect('/admin/categories');
};

exports.categoryUpdate = async (req, res) => {
    try {
        await Category.update({ nama: req.body.nama }, { where: { id: req.params.id } });
        req.flash('success', 'Kategori diperbarui!');
    } catch (err) {
        req.flash('error', 'Gagal memperbarui kategori');
    }
    res.redirect('/admin/categories');
};

exports.categoryDelete = async (req, res) => {
    try {
        await Category.destroy({ where: { id: req.params.id } });
        req.flash('success', 'Kategori dihapus!');
    } catch (err) {
        req.flash('error', 'Gagal menghapus kategori');
    }
    res.redirect('/admin/categories');
};

// --- PRODUCT CRUD ---
exports.productList = async (req, res) => {
    try {
        const products = await Product.findAll({ include: [{ model: Category, as: 'category' }] });
        const categories = await Category.findAll();
        res.render('admin/products', { title: 'Kelola Produk', products, categories });
    } catch (err) {
        req.flash('error', 'Gagal memuat produk');
        res.redirect('/admin');
    }
};

exports.productAdd = async (req, res) => {
    try {
        const { nama, categoryId, harga, stok, deskripsi } = req.body;
        let gambar = req.file ? req.file.filename : null;
        await Product.create({ nama, categoryId, harga, stok, deskripsi, gambar });
        req.flash('success', 'Produk berhasil ditambahkan!');
    } catch (err) {
        req.flash('error', 'Gagal menambah produk.');
    }
    res.redirect('/admin/products');
};

exports.productEditPage = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        const categories = await Category.findAll();
        res.render('admin/editProduct', { title: 'Edit Produk', product, categories });
    } catch (err) {
        req.flash('error', 'Produk tidak ditemukan');
        res.redirect('/admin/products');
    }
};

exports.productUpdate = async (req, res) => {
    try {
        const { nama, categoryId, harga, stok, deskripsi } = req.body;
        const product = await Product.findByPk(req.params.id);
        let gambar = product.gambar;
        
        if (req.file) {
            // Hapus gambar lama jika ada
            if (gambar && fs.existsSync(path.join(__dirname, '../public/uploads/', gambar))) {
                fs.unlinkSync(path.join(__dirname, '../public/uploads/', gambar));
            }
            gambar = req.file.filename;
        }
        await product.update({ nama, categoryId, harga, stok, deskripsi, gambar });
        req.flash('success', 'Produk berhasil diperbarui!');
    } catch (err) {
        req.flash('error', 'Gagal memperbarui produk');
    }
    res.redirect('/admin/products');
};

exports.productDelete = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product && product.gambar && fs.existsSync(path.join(__dirname, '../public/uploads/', product.gambar))) {
            fs.unlinkSync(path.join(__dirname, '../public/uploads/', product.gambar));
        }
        await product.destroy();
        req.flash('success', 'Produk dihapus!');
    } catch (err) {
        req.flash('error', 'Gagal menghapus produk');
    }
    res.redirect('/admin/products');
};

// --- ORDER MANAGEMENT ---
exports.orderList = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{ model: User, as: 'user' }],
            order: [['createdAt', 'DESC']]
        });
        res.render('admin/orders', { title: 'Kelola Pesanan', orders });
    } catch (err) {
        req.flash('error', 'Gagal memuat data pesanan');
        res.redirect('/admin');
    }
};

exports.orderDetail = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user' },
                { model: OrderDetail, as: 'orderDetails', include: [{ model: Product, as: 'product' }] }
            ]
        });
        if (!order) {
            req.flash('error', 'Pesanan tidak ditemukan');
            return res.redirect('/admin/orders');
        }
        res.render('admin/order_detail', { title: 'Detail Pesanan', order });
    } catch (err) {
        req.flash('error', 'Terjadi kesalahan sistem');
        res.redirect('/admin/orders');
    }
};

exports.orderUpdateStatus = async (req, res) => {
    try {
        await Order.update({ status: req.body.status }, { where: { id: req.params.id } });
        req.flash('success', 'Status pesanan diperbarui!');
    } catch (err) {
        req.flash('error', 'Gagal mengubah status');
    }
    res.redirect(`/admin/orders/${req.params.id}`);
};

// --- USER & REVIEW MANAGEMENT ---
exports.userList = async (req, res) => {
    try {
        const users = await User.findAll({ where: { role: 'customer' } });
        res.render('admin/users', { title: 'Kelola Pengguna', users });
    } catch (err) {
        req.flash('error', 'Gagal memuat data pengguna');
        res.redirect('/admin');
    }
};

exports.userDelete = async (req, res) => {
    try {
        await User.destroy({ where: { id: req.params.id } });
        req.flash('success', 'Pengguna dihapus!');
    } catch (err) {
        req.flash('error', 'Gagal menghapus pengguna');
    }
    res.redirect('/admin/users');
};

exports.reviewList = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [{ model: User, as: 'user' }, { model: Product, as: 'product' }]
        });
        res.render('admin/reviews', { title: 'Kelola Review', reviews });
    } catch (err) {
        req.flash('error', 'Gagal memuat review');
        res.redirect('/admin');
    }
};

exports.reviewDelete = async (req, res) => {
    try {
        await Review.destroy({ where: { id: req.params.id } });
        req.flash('success', 'Review dihapus!');
    } catch (err) {
        req.flash('error', 'Gagal menghapus review');
    }
    res.redirect('/admin/reviews');
};