const productRepository = require('../repositories/ProductRepository');

class ProductService {
    async getProductDetail(id) {
        const product = await productRepository.findById(id);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }

        await productRepository.incrementViews(id);
        const images = await productRepository.getImages(id);
        const similarProducts = await productRepository.getSimilarProducts(product.category_id, id);

        return { product, images, similarProducts };
    }

    async getAllProducts() {
        return await productRepository.findAll();
    }

    async addProduct(productData, imageUrl) {
        const productId = await productRepository.create(productData);
        if (imageUrl) {
            await productRepository.addImage(productId, imageUrl);
        }
        return productId;
    }
}

module.exports = new ProductService();
