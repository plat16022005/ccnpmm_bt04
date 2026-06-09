const db = require('../config/database');

class CategoryRepository {
    async findAll() {
        const [categories] = await db.query('SELECT * FROM categories');
        return categories;
    }
}

module.exports = new CategoryRepository();
