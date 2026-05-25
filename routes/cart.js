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

        res.render('cart', {
            title: 'Giỏ hàng',
            cartItems
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
});

router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { productId, quantity = 1 } = req.body;
        const [existing] = await db.query('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
        if (existing.length > 0) {
            await db.query('UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?', [quantity, userId, productId]);
        } else {
            await db.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity]);
        }
        res.json({ success: true, message: 'Đã thêm vào giỏ hàng' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

router.post('/update', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { productId, quantity } = req.body;
        if (quantity <= 0) {
            await db.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
        } else {
            await db.query('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', [quantity, userId, productId]);
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

router.post('/remove', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { productId } = req.body;
        await db.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

router.get('/count', async (req, res) => {
    if (!req.session.user) return res.json({ count: 0 });
    try {
        const [result] = await db.query('SELECT SUM(quantity) as count FROM cart_items WHERE user_id = ?', [req.session.user.id]);
        res.json({ count: result[0].count || 0 });
    } catch (error) {
        res.json({ count: 0 });
    }
});

module.exports = router;