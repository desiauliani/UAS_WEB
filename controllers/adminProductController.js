const db = require('../models');
const fs = require('fs');
const path = require('path');
const { Product, Category } = db;
const { validationResult } = require('express-validator');

// Helper untuk menghapus file gambar lama
const deleteFile = (filePath) => {
    if (!filePath) return;
    // Menghilangkan slash di awal agar path relatif benar
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullPath = path.join(__dirname, '../public', cleanPath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

exports.index = async (req, res) => {
    try {
        const products = await Product.findAll({ include: [{ model: Category, as: 'category' }] });
        const categories = await Category.findAll();
        res.render('admin/products/index', { title: 'Katalog Produk', products, categories });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Gagal memuat katalog');
        res.redirect('/admin/dashboard');
    }
};

exports.store = async (req, res) => {
    const errors = validationResult(req);
    // Validasi input dan cek file
    if (!errors.isEmpty() || !req.file) {
        if (req.file) deleteFile('/uploads/products/' + req.file.filename); 
        req.flash('error', 'Input tidak valid atau foto wajib diisi');
        return res.redirect('/admin/products');
    }
    try {
        await Product.create({
            ...req.body,
            gambar: '/uploads/products/' + req.file.filename
        });
        req.flash('success', 'Produk berhasil ditambahkan');
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Gagal menyimpan');
        res.redirect('/admin/products');
    }
};

exports.editPage = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        const categories = await Category.findAll();
        res.render('admin/editProduct', { title: 'Edit Produk', product, categories });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Gagal memuat halaman edit');
        res.redirect('/admin/products');
    }
};

exports.update = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            req.flash('error', 'Produk tidak ditemukan');
            return res.redirect('/admin/products');
        }

        let imagePath = product.gambar;

        // Jika user upload file baru, hapus yang lama dan update path
        if (req.file) {
            deleteFile(product.gambar);
            imagePath = '/uploads/products/' + req.file.filename;
        }

        // Update data ke database
        await product.update({ 
            ...req.body, 
            gambar: imagePath 
        });

        req.flash('success', 'Produk berhasil diperbarui');
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Gagal mengupdate produk: ' + err.message);
        res.redirect('/admin/products');
    }
};

exports.delete = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            deleteFile(product.gambar);
            await product.destroy();
        }
        req.flash('success', 'Produk berhasil dihapus');
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Gagal menghapus produk');
        res.redirect('/admin/products');
    }
};