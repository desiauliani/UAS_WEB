const bcrypt = require('bcrypt');
const db = require('../models');
const User = db.User;

exports.loginPage = (req, res) => {
    res.render('auth/login', { title: 'Login - Rhopaloceraz', layout: false });
};

exports.registerPage = (req, res) => {
    res.render('auth/register', { title: 'Register - Rhopaloceraz', layout: false });
};

exports.registerProcess = async (req, res) => {
    try {
        const { nama, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            req.flash('error', 'Password dan Konfirmasi Password tidak cocok!');
            return res.redirect('/auth/register');
        }

        const userExist = await User.findOne({ where: { email } });
        if (userExist) {
            req.flash('error', 'Email sudah terdaftar!');
            return res.redirect('/auth/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            nama,
            email,
            password: hashedPassword,
            role: 'customer' // Default role
        });

        req.flash('success', 'Registrasi berhasil! Silakan login.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Terjadi kesalahan pada server.');
        res.redirect('/auth/register');
    }
};

exports.loginProcess = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            req.flash('error', 'Email atau Password salah!');
            return res.redirect('/auth/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Email atau Password salah!');
            return res.redirect('/auth/login');
        }

        // Set Session
        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.user = { id: user.id, nama: user.nama, email: user.email, role: user.role };
        req.session.cart = []; // Inisialisasi keranjang belanja

        if (user.role === 'admin') {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        req.flash('error', 'Terjadi kesalahan pada server.');
        res.redirect('/auth/login');
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error(err);
        res.redirect('/auth/login');
    });
};