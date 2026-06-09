const cartRepository = require('../repositories/CartRepository');

class CartService {
    async getCart(userId) {
        return await cartRepository.getCartItems(userId);
    }

    async addToCart(userId, productId, quantity) {
        const existingItem = await cartRepository.findItem(userId, productId);
        if (existingItem) {
            await cartRepository.incrementQuantity(userId, productId, quantity);
        } else {
            await cartRepository.addItem(userId, productId, quantity);
        }
    }

    async updateCartItem(userId, productId, quantity) {
        if (quantity <= 0) {
            await cartRepository.removeItem(userId, productId);
        } else {
            await cartRepository.updateQuantity(userId, productId, quantity);
        }
    }

    async removeFromCart(userId, productId) {
        await cartRepository.removeItem(userId, productId);
    }

    async getCartCount(userId) {
        return await cartRepository.getCount(userId);
    }
}

module.exports = new CartService();
