const orderRepository = require('../repositories/OrderRepository');
const productRepository = require('../repositories/ProductRepository');

class OrderService {
    async getUserOrders(userId) {
        await orderRepository.autoConfirmPending();
        return await orderRepository.findByUserId(userId);
    }

    async getOrderDetail(orderId, userId, userRole) {
        await orderRepository.autoConfirmById(orderId);
        
        let order;
        if (userRole === 'admin') {
            order = await orderRepository.findById(orderId);
        } else {
            order = await orderRepository.findByIdAndUser(orderId, userId);
        }

        if (!order) {
            throw new Error('Không tìm thấy đơn hàng hoặc bạn không có quyền xem');
        }

        const items = await orderRepository.getOrderItems(orderId);
        return { order, items };
    }

    async cancelOrder(orderId, userId) {
        const order = await orderRepository.findByIdAndUser(orderId, userId);
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }

        const now = new Date();
        const createdAt = new Date(order.created_at);
        const diffMinutes = (now - createdAt) / (1000 * 60);

        if (['cancelled', 'delivered', 'shipping'].includes(order.status)) {
            throw new Error('Không thể hủy đơn hàng ở trạng thái này');
        }

        if (diffMinutes > 30) {
            if (order.status === 'preparing') {
                await orderRepository.updateStatus(orderId, 'cancel_requested');
                return { success: true, message: 'Đã gửi yêu cầu hủy đơn hàng' };
            } else {
                throw new Error('Đã quá 30 phút, không thể hủy đơn hàng trực tiếp');
            }
        }

        // Allow direct cancellation within 30 mins
        await orderRepository.updateStatus(orderId, 'cancelled');
        
        // Restore stock
        const items = await orderRepository.getOrderItems(orderId);
        for (const item of items) {
            await productRepository.updateStockAndSold(item.product_id, item.quantity);
        }

        return { success: true, message: 'Hủy đơn hàng thành công' };
    }

    async getAllOrders() {
        return await orderRepository.findAll();
    }

    async updateOrderStatus(orderId, status) {
        await orderRepository.updateStatus(orderId, status);
    }
}

module.exports = new OrderService();
