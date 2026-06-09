const db = require('../config/database');

class UserRepository {
    async findByUsernameAndPassword(username, password) {
        const [users] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        return users.length > 0 ? users[0] : null;
    }

    async findById(id) {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return users.length > 0 ? users[0] : null;
    }

    async count() {
        const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM users');
        return count;
    }
}

module.exports = new UserRepository();
