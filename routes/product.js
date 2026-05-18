const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        // Fetch product info with category name
        const [productData] = await db.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ?
        `, [productId]);

        if (productData.length === 0) {
            return res.status(404).send('Không tìm thấy sản phẩm');
        }

        const product = productData[0];

        // Increment views
        await db.query(`UPDATE products SET views = views + 1 WHERE id = ?`, [productId]);

        // Fetch images
        const [images] = await db.query(`
            SELECT image_url FROM product_images WHERE product_id = ?
        `, [productId]);

        // Fetch similar products in same category
        const [similarProducts] = await db.query(`
            SELECT p.*, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p 
            WHERE p.category_id = ? AND p.id != ? 
            LIMIT 4
        `, [product.category_id, productId]);

        res.render('product-detail', {
            title: product.name,
            product,
            images: images.map(img => img.image_url),
            similarProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
});

module.exports = router;
