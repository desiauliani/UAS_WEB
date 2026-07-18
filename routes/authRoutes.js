const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isGuest, isLogin } = require('../middleware/authMiddleware');

router.get('/login', isGuest, authController.loginPage);
router.post('/login', isGuest, authController.loginProcess);

router.get('/register', isGuest, authController.registerPage);
router.post('/register', isGuest, authController.registerProcess);

router.get('/logout', isLogin, authController.logout);

module.exports = router;