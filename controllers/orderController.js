const db = require('../models');
const { Order, OrderDetail, Product } = db;

exports.checkoutPage = (req, res) => {
    const cart = req.session.cart || [];
    if (cart.length === 0) {
        req.flash('error', 'Keranjang belanja Anda kosong.');
        return res.redirect('/catalog');
    }
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
    // Render view checkout sesuai request
    res.render('customer/checkout', { title: 'Checkout - Rhopaloceraz', cart, total });
};

exports.processCheckout = async (req, res) => {
    const t = await db.sequelize.transaction(); // Menggunakan transaksi agar data aman
    try {
        const cart = req.session.cart || [];
        if (cart.length === 0) throw new Error("Keranjang kosong");
        
        const { metode_pembayaran } = req.body;
        let bukti_bayar = null;

        if (req.file) {
            bukti_bayar = req.file.filename;
        } else {
            req.flash('error', 'Bukti pembayaran wajib diunggah!');
            return res.redirect('/orders/checkout');
        }

        const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

        // 1. Buat Data Order
        const newOrder = await Order.create({
            userId: req.session.userId,
            total,
            status: 'Pending',
            metode_pembayaran,
            bukti_bayar
        }, { transaction: t });

        // 2. Buat Data OrderDetail dan kurangi stok
        for (let item of cart) {
            await OrderDetail.create({
                orderId: newOrder.id,
                productId: item.productId,
                qty: item.qty,
                subtotal: item.subtotal
            }, { transaction: t });

            const product = await Product.findByPk(item.productId, { transaction: t });
            if (product.stok < item.qty) throw new Error(`Stok ${product.nama} tidak mencukupi.`);
            await product.update({ stok: product.stok - item.qty }, { transaction: t });
        }

        // Jika berhasil, commit transaksi
        await t.commit();
        req.session.cart = []; // Kosongkan keranjang
        req.flash('success', 'Pesanan berhasil dibuat! Menunggu verifikasi admin.');
        res.redirect('/orders/history');

    } catch (err) {
        await t.rollback();
        console.error(err);
        req.flash('error', 'Gagal memproses pesanan: ' + err.message);
        res.redirect('/orders/checkout');
    }
};

exports.orderHistory = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.session.userId },
            order: [['createdAt', 'DESC']]
        });
        res.render('customer/orders', { title: 'Riwayat Pesanan', orders });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.orderDetail = async (req, res) => {
    try {
        const order = await Order.findOne({
            where: { id: req.params.id, userId: req.session.userId },
            include: [{
                model: OrderDetail,
                as: 'orderDetails',
                include: [{ model: Product, as: 'product' }]
            }]
        });
        if (!order) return res.status(404).render('error/404');
        res.render('customer/order_detail', { title: 'Detail Pesanan', order });
    } catch (err) {
        console.error(err);
        res.redirect('/orders/history');
    }
};