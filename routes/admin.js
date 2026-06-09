const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).send('Truy cập bị từ chối. Chỉ dành cho Quản trị viên.');
};

router.get('/', isAdmin, adminController.getDashboard);
router.get('/products', isAdmin, adminController.getProducts);
router.get('/products/add', isAdmin, adminController.getAddProductPage);
router.post('/products/add', isAdmin, adminController.addProduct);
router.get('/orders', isAdmin, adminController.getOrders);
router.post('/orders/:id/status', isAdmin, adminController.updateOrderStatus);

module.exports = router;
