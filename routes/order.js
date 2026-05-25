const express = require('express');
const router = express.Router();
const db = require('../config/database');

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

// List user orders
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        // Auto-confirm logic: orders pending for > 30 mins
        await db.query(`
            UPDATE orders 
            SET status = 'confirmed' 
            WHERE status = 'pending' AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE)
        `);

        const [orders] = await db.query(`
            SELECT * FROM orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `, [userId]);

        res.render('orders', {
            title: 'Đơn hàng của tôi',
            orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
});

// Order detail
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.id;

        // Auto-confirm this order if pending > 30 mins
        await db.query(`
            UPDATE orders 
            SET status = 'confirmed' 
            WHERE id = ? AND status = 'pending' AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE)
        `, [orderId]);

        const [orders] = await db.query(`
            SELECT * FROM orders WHERE id = ? AND user_id = ?
        `, [orderId, userId]);

        if (orders.length === 0) {
            return res.status(404).send('Không tìm thấy đơn hàng');
        }

        const order = orders[0];

        const [items] = await db.query(`
            SELECT oi.*, p.name, 
            (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId]);

        res.render('order-detail', {
            title: `Chi tiết đơn hàng #${orderId}`,
            order,
            items
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
});

// Cancel order
router.post('/:id/cancel', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.id;

        const [orders] = await db.query(`
            SELECT * FROM orders WHERE id = ? AND user_id = ?
        `, [orderId, userId]);

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const order = orders[0];
        const now = new Date();
        const createdAt = new Date(order.created_at);
        const diffMinutes = (now - createdAt) / (1000 * 60);

        if (order.status === 'cancelled' || order.status === 'delivered' || order.status === 'shipping') {
            return res.status(400).json({ success: false, message: 'Không thể hủy đơn hàng ở trạng thái này' });
        }

        if (diffMinutes > 30) {
            if (order.status === 'preparing') {
                await db.query("UPDATE orders SET status = 'cancel_requested' WHERE id = ?", [orderId]);
                return res.json({ success: true, message: 'Đã gửi yêu cầu hủy đơn hàng' });
            } else {
                return res.status(400).json({ success: false, message: 'Đã quá 30 phút, không thể hủy đơn hàng trực tiếp' });
            }
        }

        // Allow cancellation within 30 mins
        await db.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [orderId]);
        
        // Restore stock
        const [items] = await db.query("SELECT * FROM order_items WHERE order_id = ?", [orderId]);
        for (const item of items) {
            await db.query("UPDATE products SET stock = stock + ?, sold = sold - ? WHERE id = ?", [item.quantity, item.quantity, item.product_id]);
        }

        res.json({ success: true, message: 'Hủy đơn hàng thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

module.exports = router;