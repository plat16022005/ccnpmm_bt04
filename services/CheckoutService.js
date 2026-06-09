const db = require('../config/database');
const cartRepository = require('../repositories/CartRepository');
const orderRepository = require('../repositories/OrderRepository');
const productRepository = require('../repositories/ProductRepository');

class CheckoutService {
    async getCheckoutInfo(userId) {
        const cartItems = await cartRepository.getCartItems(userId);
        if (cartItems.length === 0) {
            throw new Error('Giỏ hàng trống');
        }

        let total = 0;
        cartItems.forEach(item => {
            total += (item.discount_price || item.price) * item.quantity;
        });

        return { cartItems, total };
    }

    async placeOrder(userId, orderData) {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            const { fullname, phone, address, payment_method } = orderData;
            
            // Re-fetch cart items with stock info using connection
            const [cartItems] = await connection.query(`
                SELECT ci.*, p.price, p.discount_price, p.stock, p.name
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.user_id = ?
            `, [userId]);

            if (cartItems.length === 0) throw new Error('Giỏ hàng trống');

            let totalAmount = 0;
            for (const item of cartItems) {
                if (item.stock < item.quantity) {
                    throw new Error(`Sản phẩm "${item.name}" không đủ tồn kho (Còn lại: ${item.stock})`);
                }
                totalAmount += (item.discount_price || item.price) * item.quantity;
            }

            // Create Order
            const [orderResult] = await connection.query(`
                INSERT INTO orders (user_id, total_amount, payment_method, shipping_address, fullname, phone)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [userId, totalAmount, payment_method || 'COD', address, fullname, phone]);

            const orderId = orderResult.insertId;

            // Create Order Items & Update Stock
            for (const item of cartItems) {
                await connection.query(`
                    INSERT INTO order_items (order_id, product_id, quantity, price)
                    VALUES (?, ?, ?, ?)
                `, [orderId, item.product_id, item.quantity, item.discount_price || item.price]);

                await connection.query(`
                    UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?
                `, [item.quantity, item.quantity, item.product_id]);
            }

            // Clear Cart
            await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

            await connection.commit();
            return orderId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new CheckoutService();
