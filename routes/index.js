const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
    try {
        // Fetch promoted products
        const [promoted] = await db.query(`
            SELECT p.*, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p WHERE is_promoted = TRUE LIMIT 4
        `);

        // Fetch new products
        const [newProducts] = await db.query(`
            SELECT p.*, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p WHERE is_new = TRUE ORDER BY created_at DESC LIMIT 8
        `);

        // Fetch best selling products
        const [bestSelling] = await db.query(`
            SELECT p.*, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p ORDER BY sold DESC LIMIT 8
        `);

        res.render('home', {
            title: 'Trang chủ - Cửa hàng điện tử',
            promoted,
            newProducts,
            bestSelling
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
});

router.get('/search', async (req, res) => {
    try {
        const { q, minPrice, maxPrice, category } = req.query;
        let query = `
            SELECT p.*, c.name as category_name, 
            (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE 1=1
        `;
        const params = [];

        if (q) {
            query += ` AND p.name LIKE ?`;
            params.push(`%${q}%`);
        }
        if (minPrice) {
            query += ` AND p.price >= ?`;
            params.push(minPrice);
        }
        if (maxPrice) {
            query += ` AND p.price <= ?`;
            params.push(maxPrice);
        }
        if (category) {
            query += ` AND p.category_id = ?`;
            params.push(category);
        }

        const [products] = await db.query(query, params);
        const [categories] = await db.query(`SELECT * FROM categories`);

        res.render('search', {
            title: 'Tìm kiếm sản phẩm',
            products,
            categories,
            query: req.query
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
});

module.exports = router;
