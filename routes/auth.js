const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('login', { title: 'Đăng nhập', error: null });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (users.length > 0) {
            req.session.user = {
                id: users[0].id,
                username: users[0].username,
                fullname: users[0].fullname,
                role: users[0].role
            };
            res.redirect('/');
        } else {
            res.render('login', { title: 'Đăng nhập', error: 'Sai tài khoản hoặc mật khẩu' });
        }
    } catch (error) {
        console.error(error);
        res.render('login', { title: 'Đăng nhập', error: 'Lỗi máy chủ' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;
