const cartService = require('../services/CartService');

class CartController {
    async getCartPage(req, res) {
        try {
            const userId = req.session.user.id;
            const cartItems = await cartService.getCart(userId);
            res.render('cart', { title: 'Giỏ hàng', cartItems });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    async addToCart(req, res) {
        try {
            const userId = req.session.user.id;
            const { productId, quantity = 1 } = req.body;
            await cartService.addToCart(userId, productId, parseInt(quantity));
            res.json({ success: true, message: 'Đã thêm vào giỏ hàng' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }

    async updateCart(req, res) {
        try {
            const userId = req.session.user.id;
            const { productId, quantity } = req.body;
            await cartService.updateCartItem(userId, productId, parseInt(quantity));
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }

    async removeFromCart(req, res) {
        try {
            const userId = req.session.user.id;
            const { productId } = req.body;
            await cartService.removeFromCart(userId, productId);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }

    async getCartCount(req, res) {
        if (!req.session.user) return res.json({ count: 0 });
        try {
            const count = await cartService.getCartCount(req.session.user.id);
            res.json({ count });
        } catch (error) {
            res.json({ count: 0 });
        }
    }
}

module.exports = new CartController();
