const productRepository = require('../repositories/ProductRepository');
const orderRepository = require('../repositories/OrderRepository');
const userRepository = require('../repositories/UserRepository');
const categoryRepository = require('../repositories/CategoryRepository');

class AdminService {
    async getDashboardStats() {
        const productCount = await productRepository.count();
        const orderCount = await orderRepository.count();
        const userCount = await userRepository.count();
        const totalRevenue = await orderRepository.getTotalRevenue();

        return { productCount, orderCount, userCount, totalRevenue };
    }

    async getCategories() {
        return await categoryRepository.findAll();
    }
}

module.exports = new AdminService();
