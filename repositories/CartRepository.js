const db = require('../config/database');

class CartRepository {
    async getCartItems(userId) {
        const [items] = await db.query(`
            SELECT ci.*, p.name, p.price, p.discount_price, 
            (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
        `, [userId]);
        return items;
    }

    async findItem(userId, productId) {
        const [items] = await db.query('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
        return items.length > 0 ? items[0] : null;
    }

    async addItem(userId, productId, quantity) {
        await db.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity]);
    }

    async updateQuantity(userId, productId, quantity) {
        await db.query('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', [quantity, userId, productId]);
    }

    async incrementQuantity(userId, productId, quantity) {
        await db.query('UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?', [quantity, userId, productId]);
    }

    async removeItem(userId, productId) {
        await db.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
    }

    async getCount(userId) {
        const [result] = await db.query('SELECT SUM(quantity) as count FROM cart_items WHERE user_id = ?', [userId]);
        return result[0].count || 0;
    }

    async clearCart(userId) {
        await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    }
}

module.exports = new CartRepository();
