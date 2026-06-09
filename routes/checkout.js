const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/CheckoutController');

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

router.get('/', isAuthenticated, checkoutController.getCheckoutPage);
router.post('/', isAuthenticated, checkoutController.placeOrder);

module.exports = router;
