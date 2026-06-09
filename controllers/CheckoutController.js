const checkoutService = require('../services/CheckoutService');

class CheckoutController {
    async getCheckoutPage(req, res) {
        try {
            const userId = req.session.user.id;
            const { cartItems, total } = await checkoutService.getCheckoutInfo(userId);
            res.render('checkout', {
                title: 'Thanh toán',
                cartItems,
                total,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            if (error.message === 'Giỏ hàng trống') {
                return res.redirect('/cart');
            }
            res.status(500).send('Lỗi máy chủ');
        }
    }

    async placeOrder(req, res) {
        try {
            const userId = req.session.user.id;
            const orderId = await checkoutService.placeOrder(userId, req.body);
            res.json({ success: true, orderId });
        } catch (error) {
            console.error(error);
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new CheckoutController();
