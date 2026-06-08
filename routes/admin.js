const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).send('Truy cập bị từ chối. Chỉ dành cho Quản trị viên.');
};

// Admin Dashboard
router.get('/', isAdmin, async (req, res) => {
    try {
        const [[{ productCount }]] = await db.query('SELECT COUNT(*) as productCount FROM products');
        const [[{ orderCount }]] = await db.query('SELECT COUNT(*) as orderCount FROM orders');
        const [[{ userCount }]] = await db.query('SELECT COUNT(*) as userCount FROM users');
        const [[{ totalRevenue }]] = await db.query("SELECT SUM(total_amount) as totalRevenue FROM orders WHERE status = 'delivered'");

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            stats: {
                productCount,
                orderCount,
                userCount,
                totalRevenue: totalRevenue || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
});

// Manage Products
router.get('/products', isAdmin, async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.created_at DESC
        `);
        res.render('admin/products', { title: 'Quản lý sản phẩm', products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
});

// Add Product Page
router.get('/products/add', isAdmin, async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        res.render('admin/add-product', { title: 'Thêm sản phẩm mới', categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
});

// Add Product Action
router.post('/products/add', isAdmin, async (req, res) => {
    const { name, category_id, description, price, discount_price, stock, image_url } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO products (name, category_id, description, price, discount_price, stock) VALUES (?, ?, ?, ?, ?, ?)',
            [name, category_id, description, price, discount_price || null, stock]
        );
        
        const productId = result.insertId;
        if (image_url) {
            await db.query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [productId, image_url]);
        }

        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
});

// Manage Orders
router.get('/orders', isAdmin, async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, u.fullname as user_name 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);
        res.render('admin/orders', { title: 'Quản lý đơn hàng', orders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
});

// Update Order Status
router.post('/orders/:id/status', isAdmin, async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;
    try {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

module.exports = router;
