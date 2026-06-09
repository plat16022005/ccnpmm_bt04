const productService = require('../services/ProductService');

class ProductController {
    async getProductDetail(req, res) {
        try {
            const productId = req.params.id;
            const data = await productService.getProductDetail(productId);
            res.render('product-detail', {
                title: data.product.name,
                product: data.product,
                images: data.images,
                similarProducts: data.similarProducts
            });
        } catch (error) {
            console.error(error);
            res.status(404).send(error.message);
        }
    }
}

module.exports = new ProductController();
