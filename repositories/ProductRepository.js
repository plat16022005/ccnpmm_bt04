const db = require('../config/database');

class ProductRepository {
    async findById(id) {
        const [products] = await db.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ?
        `, [id]);
        return products.length > 0 ? products[0] : null;
    }

    async incrementViews(id) {
        await db.query('UPDATE products SET views = views + 1 WHERE id = ?', [id]);
    }

    async getImages(productId) {
        const [images] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [productId]);
        return images.map(img => img.image_url);
    }

    async getSimilarProducts(categoryId, excludeId, limit = 4) {
        const [products] = await db.query(`
            SELECT p.*, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p 
            WHERE p.category_id = ? AND p.id != ? 
            LIMIT ?
        `, [categoryId, excludeId, limit]);
        return products;
    }

    async findAll() {
        const [products] = await db.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.created_at DESC
        `);
        return products;
    }

    async count() {
        const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM products');
        return count;
    }

    async create(productData) {
        const { name, category_id, description, price, discount_price, stock } = productData;
        const [result] = await db.query(
            'INSERT INTO products (name, category_id, description, price, discount_price, stock) VALUES (?, ?, ?, ?, ?, ?)',
            [name, category_id, description, price, discount_price || null, stock]
        );
        return result.insertId;
    }

    async addImage(productId, imageUrl) {
        await db.query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [productId, imageUrl]);
    }

    async getFeaturedProducts(limit = 8) {
        const [products] = await db.query(`
            SELECT p.*, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p 
            WHERE p.is_promoted = TRUE 
            LIMIT ?
        `, [limit]);
        return products;
    }

    async getNewProducts(limit = 8) {
        const [products] = await db.query(`
            SELECT p.*, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p 
            WHERE p.is_new = TRUE 
            LIMIT ?
        `, [limit]);
        return products;
    }

    async getBestSelling(limit = 5, offset = 0) {
        const [products] = await db.query(`
            SELECT p.*, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p ORDER BY sold DESC LIMIT ? OFFSET ?
        `, [limit, offset]);
        return products;
    }

    async getMostViewed(limit = 5, offset = 0) {
        const [products] = await db.query(`
            SELECT p.*, (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image 
            FROM products p ORDER BY views DESC LIMIT ? OFFSET ?
        `, [limit, offset]);
        return products;
    }

    async search(filters) {
        const { q, minPrice, maxPrice, category, page = 1, limit = 6 } = filters;
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
            params.push(parseFloat(minPrice));
        }
        if (maxPrice) {
            query += ` AND p.price <= ?`;
            params.push(parseFloat(maxPrice));
        }
        if (category) {
            query += ` AND p.category_id = ?`;
            params.push(parseInt(category));
        }

        query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [products] = await db.query(query, params);
        return products;
    }
}

module.exports = new ProductRepository();
