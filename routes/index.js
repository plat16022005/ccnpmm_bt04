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

        // Fetch best selling products (initially 5)
        const [bestSelling] = await db.query(`
            SELECT p.*, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p ORDER BY sold DESC LIMIT 5
        `);

        // Fetch most viewed products (initially 5)
        const [mostViewed] = await db.query(`
            SELECT p.*, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p ORDER BY views DESC LIMIT 5
        `);

        res.render('home', {
            title: 'Trang chủ - Cửa hàng điện tử',
            promoted,
            newProducts,
            bestSelling,
            mostViewed
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

        query += ` ORDER BY p.created_at DESC LIMIT 6 OFFSET 0`;

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

// API for Best Selling (Pagination horizontal)
router.get('/api/products/best-selling', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        const [products] = await db.query(`
            SELECT p.*, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p ORDER BY sold DESC LIMIT ? OFFSET ?
        `, [limit, offset]);
        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
});

// API for Most Viewed (Pagination horizontal)
router.get('/api/products/most-viewed', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        const [products] = await db.query(`
            SELECT p.*, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p ORDER BY views DESC LIMIT ? OFFSET ?
        `, [limit, offset]);
        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
});

// API for Lazy loading in Category / Search
router.get('/api/products', async (req, res) => {
    try {
        const { q, minPrice, maxPrice, category, page = 1, limit = 6 } = req.query;
        const offset = (page - 1) * limit;

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

        query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [products] = await db.query(query, params);
        res.json({ products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
});

module.exports = router;
