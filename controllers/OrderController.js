const orderService = require('../services/OrderService');

class OrderController {
    async getUserOrders(req, res) {
        try {
            const userId = req.session.user.id;
            const orders = await orderService.getUserOrders(userId);
            res.render('orders', { title: 'Đơn hàng của tôi', orders });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    async getOrderDetail(req, res) {
        try {
            const userId = req.session.user.id;
            const userRole = req.session.user.role;
            const orderId = req.params.id;
            const { order, items } = await orderService.getOrderDetail(orderId, userId, userRole);
            res.render('order-detail', {
                title: `Chi tiết đơn hàng #${orderId}`,
                order,
                items
            });
        } catch (error) {
            console.error(error);
            res.status(404).send(error.message);
        }
    }

    async cancelOrder(req, res) {
        try {
            const userId = req.session.user.id;
            const orderId = req.params.id;
            const result = await orderService.cancelOrder(orderId, userId);
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new OrderController();
