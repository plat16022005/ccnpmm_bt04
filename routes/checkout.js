const express = require('express');
const router = express.Router();
const db = require('../config/database');

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [cartItems] = await db.query(`
            SELECT ci.*, p.name, p.price, p.discount_price,
            (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
        `, [userId]);

        if (cartItems.length === 0) {
            return res.redirect('/cart');
        }

        let total = 0;
        cartItems.forEach(item => {
            total += (item.discount_price || item.price) * item.quantity;
        });

        res.render('checkout', {
            title: 'Thanh toán',
            cartItems,
            total,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
});

router.post('/', isAuthenticated, async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const userId = req.session.user.id;
        const { fullname, phone, address, payment_method } = req.body;

        const [cartItems] = await connection.query(`
            SELECT ci.*, p.price, p.discount_price, p.stock
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
        `, [userId]);

        if (cartItems.length === 0) {
            throw new Error('Giỏ hàng trống');
        }

        let totalAmount = 0;
        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                throw new Error(`Sản phẩm ${item.product_id} không đủ tồn kho`);
            }
            totalAmount += (item.discount_price || item.price) * item.quantity;
        }

        const [orderResult] = await connection.query(`
            INSERT INTO orders (user_id, total_amount, payment_method, shipping_address, fullname, phone)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, totalAmount, payment_method || 'COD', address, fullname, phone]);

        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            await connection.query(`
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
            `, [orderId, item.product_id, item.quantity, item.discount_price || item.price]);

            await connection.query(`
                UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?
            `, [item.quantity, item.quantity, item.product_id]);
        }

        await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

        await connection.commit();
        res.json({ success: true, orderId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;