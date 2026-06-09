const productRepository = require('../repositories/ProductRepository');
const categoryRepository = require('../repositories/CategoryRepository');

class IndexController {
    async getHomePage(req, res) {
        try {
            const promoted = await productRepository.getFeaturedProducts(4);
            const newProducts = await productRepository.getNewProducts(8);
            const bestSelling = await productRepository.getBestSelling(5);
            const mostViewed = await productRepository.getMostViewed(5);

            res.render('home', {
                title: 'Trang chủ - Cửa hàng điện tử',
                promoted,
                newProducts,
                bestSelling,
                mostViewed
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    async search(req, res) {
        try {
            const products = await productRepository.search(req.query);
            const categories = await categoryRepository.findAll();

            res.render('search', {
                title: 'Tìm kiếm sản phẩm',
                products,
                categories,
                query: req.query
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi máy chủ');
        }
    }

    async getBestSellingApi(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 5;
            const offset = (page - 1) * limit;
            const products = await productRepository.getBestSelling(limit, offset);
            res.json({ products });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi máy chủ' });
        }
    }

    async getMostViewedApi(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 5;
            const offset = (page - 1) * limit;
            const products = await productRepository.getMostViewed(limit, offset);
            res.json({ products });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi máy chủ' });
        }
    }

    async getProductsApi(req, res) {
        try {
            const products = await productRepository.search(req.query);
            res.json({ products });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Lỗi máy chủ' });
        }
    }
}

module.exports = new IndexController();
