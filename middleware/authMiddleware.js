module.exports = {
    isLogin: (req, res, next) => {
        if (req.session.userId) {
            return next();
        }
        req.flash('error', 'Silakan login terlebih dahulu.');
        res.redirect('/auth/login');
    },
    
    isAdmin: (req, res, next) => {
        if (req.session.userId && req.session.role === 'admin') {
            return next();
        }
        res.status(403).render('error/unauthorized', { 
            title: 'Unauthorized', 
            layout: false 
        });
    },

    isCustomer: (req, res, next) => {
        if (req.session.userId && req.session.role === 'customer') {
            return next();
        }
        res.status(403).render('error/unauthorized', { 
            title: 'Unauthorized', 
            layout: false 
        });
    },

    isGuest: (req, res, next) => {
        if (!req.session.userId) {
            return next();
        }
        if (req.session.role === 'admin') return res.redirect('/admin/dashboard');
        if (req.session.role === 'customer') return res.redirect('/customer/dashboard');
    }
};