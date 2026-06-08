const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'secret-key-123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set true if https
}));

// Global variable for views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Import Routes
const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/product');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');

// Use Routes
app.use('/', indexRoutes);
app.use('/product', productRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
