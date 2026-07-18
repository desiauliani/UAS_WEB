require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const multer = require('multer'); 
const db = require('./models');

const app = express();

// --- SETUP VIEW ENGINE (EJS) ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- SETUP MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// --- SETUP SESSION & FLASH ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        maxAge: 1000 * 60 * 60 * 24 
    }
}));
app.use(flash());

// --- GLOBAL VARIABLES UNTUK VIEWS ---
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    res.locals.user = req.session.user || null;
    res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
    next();
});

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
// Hapus atau abaikan adminProductRoutes jika isinya sudah ada di adminRoutes

// --- PENGGUNAAN ROUTES ---
app.use('/', customerRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes); // adminRoutes sudah mencakup produk (products)
app.use('/orders', orderRoutes);

// --- GLOBAL ERROR HANDLING ---
// 404 Not Found
app.use((req, res, next) => {
    res.status(404).render('error/404', { title: '404 - Halaman Tidak Ditemukan', layout: false });
});

// 500 Internal Server Error & Multer Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err instanceof multer.MulterError) {
        req.flash('error', 'Terjadi kesalahan saat upload file: ' + err.message);
        return res.redirect('back');
    }
    
    res.status(500).render('error/500', { title: '500 - Server Error', layout: false });
});

// --- START SERVER & SYNC DATABASE ---
const PORT = process.env.PORT || 3000;

db.sequelize.sync({ alter: true }) 
    .then(() => {
        console.log('Database MySQL Terhubung dan Sinkron.');
        app.listen(PORT, () => {
            console.log(`Server Rhopaloceraz berjalan di http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Gagal menghubungkan database:', err.message);
    });