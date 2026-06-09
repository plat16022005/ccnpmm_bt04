const adminService = require('../services/AdminService');
const productService = require('../services/ProductService');
const orderService = require('../services/OrderService');

class AdminController {
    async getDashboard(req, res) {
        try {
            const stats = await adminService.getDashboardStats();
            res.render('admin/dashboard', { title: 'Admin Dashboard', stats });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    async getProducts(req, res) {
        try {
            const products = await productService.getAllProducts();
            res.render('admin/products', { title: 'Quản lý sản phẩm', products });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    async getAddProductPage(req, res) {
        try {
            const categories = await adminService.getCategories();
            res.render('admin/add-product', { title: 'Thêm sản phẩm mới', categories });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    async addProduct(req, res) {
        const { name, category_id, description, price, discount_price, stock, image_url } = req.body;
        try {
            await productService.addProduct({ name, category_id, description, price, discount_price, stock }, image_url);
            res.redirect('/admin/products');
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    async getOrders(req, res) {
        try {
            const orders = await orderService.getAllOrders();
            res.render('admin/orders', { title: 'Quản lý đơn hàng', orders });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    async updateOrderStatus(req, res) {
        const { status } = req.body;
        const orderId = req.params.id;
        try {
            await orderService.updateOrderStatus(orderId, status);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }
}

module.exports = new AdminController();
