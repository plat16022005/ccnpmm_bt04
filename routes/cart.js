const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

router.get('/', isAuthenticated, cartController.getCartPage);
router.post('/add', isAuthenticated, cartController.addToCart);
router.post('/update', isAuthenticated, cartController.updateCart);
router.post('/remove', isAuthenticated, cartController.removeFromCart);
router.get('/count', cartController.getCartCount);

module.exports = router;
