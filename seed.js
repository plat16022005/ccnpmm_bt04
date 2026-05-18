const db = require('./config/database');

const categories = [1, 2]; // 1: Điện thoại, 2: Laptop
const brands = ['Apple', 'Samsung', 'Dell', 'Asus', 'HP', 'Lenovo', 'Xiaomi', 'Oppo'];
const productTypes = ['Pro', 'Max', 'Ultra', 'Plus', 'Lite', 'Gaming', 'Office'];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProduct(index) {
    const categoryId = categories[randomInt(0, categories.length - 1)];
    const brand = brands[randomInt(0, brands.length - 1)];
    const type = productTypes[randomInt(0, productTypes.length - 1)];
    
    let baseName = categoryId === 1 ? 'Điện thoại' : 'Laptop';
    const name = `${baseName} ${brand} ${type} ${index + 10}`;
    
    const price = randomInt(50, 400) * 100000; // 5M to 40M
    const isDiscount = Math.random() > 0.5;
    const discountPrice = isDiscount ? price - randomInt(5, 20) * 100000 : null;
    
    const stock = randomInt(10, 200);
    const sold = randomInt(0, 150);
    const views = randomInt(50, 1000);
    
    const isPromoted = Math.random() > 0.7;
    const isNew = Math.random() > 0.6;
    
    const images = categoryId === 1 
        ? ['https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg', 'https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg']
        : ['https://cdn.tgdd.vn/Products/Images/44/282827/apple-macbook-air-m2-2022-xam-600x600.jpg'];
        
    const image = images[randomInt(0, images.length - 1)];

    return {
        categoryId, name, price, discountPrice, stock, sold, views, isPromoted, isNew, image
    };
}

async function seed() {
    try {
        console.log('Bắt đầu thêm dữ liệu mẫu...');
        
        for (let i = 1; i <= 25; i++) {
            const p = generateProduct(i);
            
            const [result] = await db.query(
                `INSERT INTO products (category_id, name, description, price, discount_price, stock, sold, views, is_promoted, is_new) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.categoryId, p.name, `Mô tả chi tiết cho ${p.name}`, p.price, p.discountPrice, p.stock, p.sold, p.views, p.isPromoted, p.isNew]
            );
            
            const productId = result.insertId;
            
            await db.query(
                `INSERT INTO product_images (product_id, image_url) VALUES (?, ?)`,
                [productId, p.image]
            );
        }
        
        console.log('Thêm 25 sản phẩm mẫu thành công!');
    } catch (error) {
        console.error('Lỗi khi thêm dữ liệu:', error);
    } finally {
        process.exit(0);
    }
}

seed();
