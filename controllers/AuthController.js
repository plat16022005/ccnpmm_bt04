const authService = require('../services/AuthService');

class AuthController {
    getLoginPage(req, res) {
        if (req.session.user) return res.redirect('/');
        res.render('login', { title: 'Đăng nhập', error: null });
    }

    async login(req, res) {
        const { username, password } = req.body;
        try {
            const user = await authService.login(username, password);
            req.session.user = {
                id: user.id,
                username: user.username,
                fullname: user.fullname,
                role: user.role
            };
            res.redirect('/');
        } catch (error) {
            res.render('login', { title: 'Đăng nhập', error: error.message });
        }
    }

    logout(req, res) {
        req.session.destroy();
        res.redirect('/auth/login');
    }
}

module.exports = new AuthController();
