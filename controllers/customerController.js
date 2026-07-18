const db = require('../models');
const { Product, Category, Review, User, Order, OrderDetail } = db;
const { Op } = require('sequelize');

// --- HOME PAGE ---
exports.homePage = async (req, res, next) => {
    try {
        const categories = await Category.findAll();
        const latestProducts = await Product.findAll({
            include: [{ model: Category, as: 'category' }],
            limit: 4,
            order: [['createdAt', 'DESC']]
        });
        res.render('customer/home', { title: 'Rhopaloceraz - Premium Florist', products: latestProducts, categories });
    } catch (err) {
        console.error("Error pada halaman Home:", err);
        next(err);
    }
};

// --- CATALOG PAGE (DIPERBAIKI) ---
exports.catalogPage = async (req, res) => {
    try {
        const { keyword, categoryId } = req.query; 
        let whereCondition = {};

        if (keyword) {
            whereCondition.nama = { [Op.like]: `%${keyword}%` };
        }

        // Tambahkan pengecekan ini:
        if (categoryId && categoryId !== "") {
            whereCondition.categoryId = parseInt(categoryId);
        }

        console.log("Where Condition yang dikirim ke DB:", whereCondition); // Cek di terminal

        const products = await Product.findAll({
            where: whereCondition,
            include: [{ model: Category, as: 'category' }]
        });
        
        const categories = await Category.findAll();

        res.render('customer/catalog', { 
            title: 'Katalog - Rhopaloceraz', 
            products, 
            categories, 
            keyword, 
            categoryId 
        });
    } catch (err) {
        console.error("Error pada catalogPage:", err);
        res.redirect('back');
    }
};

// --- CART LOGIC ---
exports.addToCart = async (req, res) => {
    try {
        const productId = req.params.id;
        const qty = parseInt(req.body.qty) || 1;
        const product = await Product.findByPk(productId);

        if (!product) return res.redirect('back');

        if (!req.session.cart) req.session.cart = [];
        
        let cart = req.session.cart;
        let existingItem = cart.find(item => item.productId == productId);

        if (existingItem) {
            existingItem.qty += qty;
            existingItem.subtotal = existingItem.qty * existingItem.harga;
        } else {
            cart.push({
                productId: product.id,
                nama: product.nama,
                harga: product.harga,
                gambar: product.gambar,
                qty: qty,
                subtotal: product.harga * qty
            });
        }
        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};

exports.cartPage = (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
    res.render('customer/cart', { title: 'Keranjang Belanja', cart, total });
};

exports.updateCart = (req, res) => {
    const productId = req.params.id;
    const action = req.body.action;
    let cart = req.session.cart || [];
    let item = cart.find(i => i.productId == productId);

    if (item) {
        if (action === 'increase') item.qty++;
        else if (action === 'decrease' && item.qty > 1) item.qty--;
        item.subtotal = item.qty * item.harga;
    }
    res.redirect('/cart');
};

exports.deleteCart = (req, res) => {
    let cart = req.session.cart || [];
    req.session.cart = cart.filter(item => item.productId != req.params.id);
    res.redirect('/cart');
};

// --- PROFILE & REVIEW ---
exports.profilePage = async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId);
        res.render('customer/profile', { title: 'Profil Saya', userData: user });
    } catch (err) {
        res.redirect('/');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { nama, password } = req.body;
        const updateData = { nama };
        if (password) {
            updateData.password = await require('bcrypt').hash(password, 10);
        }
        await User.update(updateData, { where: { id: req.session.userId } });
        req.session.user.nama = nama;
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.redirect('/profile');
    }
};

exports.addReview = async (req, res) => {
    try {
        const { rating, komentar } = req.body;
        await Review.create({
            userId: req.session.userId,
            productId: req.params.productId,
            rating,
            komentar
        });
        res.redirect(`/product/${req.params.productId}`);
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};