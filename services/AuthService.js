const userRepository = require('../repositories/UserRepository');

class AuthService {
    async login(username, password) {
        const user = await userRepository.findByUsernameAndPassword(username, password);
        if (!user) {
            throw new Error('Sai tài khoản hoặc mật khẩu');
        }
        return user;
    }
}

module.exports = new AuthService();
