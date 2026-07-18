const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminProductController');

// Middleware
const upload = require('../middleware/uploadProduct'); 
const { validateProduct } = require('../middleware/productValidator');

// Routing
router.get('/', controller.index);
router.post('/add', upload.single('gambar'), validateProduct, controller.store);
router.get('/edit/:id', controller.editPage);
router.post('/update/:id', upload.single('gambar'), validateProduct, controller.update);
router.post('/delete/:id', controller.delete);

module.exports = router;