const { body } = require('express-validator');

exports.validateProduct = [
    body('nama').notEmpty().withMessage('Nama produk wajib diisi'),
    body('categoryId').notEmpty().withMessage('Kategori wajib dipilih'),
    body('harga').isNumeric().withMessage('Harga harus berupa angka'),
    body('stok').isNumeric().withMessage('Stok harus berupa angka'),
    body('status').isIn(['Aktif', 'Nonaktif']).withMessage('Status tidak valid')
];