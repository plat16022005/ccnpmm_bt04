const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

router.get('/', isAuthenticated, orderController.getUserOrders);
router.get('/:id', isAuthenticated, orderController.getOrderDetail);
router.post('/:id/cancel', isAuthenticated, orderController.cancelOrder);

module.exports = router;
