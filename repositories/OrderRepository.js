const db = require('../config/database');

class OrderRepository {
    async create(orderData) {
        const { user_id, total_amount, shipping_address, fullname, phone } = orderData;
        const [result] = await db.query(
            'INSERT INTO orders (user_id, total_amount, shipping_address, fullname, phone) VALUES (?, ?, ?, ?, ?)',
            [user_id, total_amount, shipping_address, fullname, phone]
        );
        return result.insertId;
    }

    async addItem(orderId, item) {
        const { product_id, quantity, price } = item;
        await db.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [orderId, product_id, quantity, price]
        );
    }

    async findByUserId(userId) {
        const [orders] = await db.query(`
            SELECT * FROM orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `, [userId]);
        return orders;
    }

    async findAll() {
        const [orders] = await db.query(`
            SELECT o.*, u.fullname as user_name 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);
        return orders;
    }

    async findById(id) {
        const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        return orders.length > 0 ? orders[0] : null;
    }

    async findByIdAndUser(id, userId) {
        const [orders] = await db.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId]);
        return orders.length > 0 ? orders[0] : null;
    }

    async getOrderItems(orderId) {
        const [items] = await db.query(`
            SELECT oi.*, p.name, 
            (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId]);
        return items;
    }

    async updateStatus(id, status) {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    }

    async autoConfirmPending() {
        await db.query(`
            UPDATE orders 
            SET status = 'confirmed' 
            WHERE status = 'pending' AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE)
        `);
    }

    async autoConfirmById(id) {
        await db.query(`
            UPDATE orders 
            SET status = 'confirmed' 
            WHERE id = ? AND status = 'pending' AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE)
        `, [id]);
    }

    async count() {
        const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM orders');
        return count;
    }

    async getTotalRevenue() {
        const [[{ totalRevenue }]] = await db.query("SELECT SUM(total_amount) as totalRevenue FROM orders WHERE status = 'delivered'");
        return totalRevenue || 0;
    }
}

module.exports = new OrderRepository();
