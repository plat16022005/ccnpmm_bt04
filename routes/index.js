const express = require('express');
const router = express.Router();
const indexController = require('../controllers/IndexController');

router.get('/', indexController.getHomePage);
router.get('/search', indexController.search);

// APIs
router.get('/api/products/best-selling', indexController.getBestSellingApi);
router.get('/api/products/most-viewed', indexController.getMostViewedApi);
router.get('/api/products', indexController.getProductsApi);

module.exports = router;
