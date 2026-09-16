const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('./config/db');
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// ДОДАНО: Створюємо папку uploads, якщо її немає
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// ДОДАНО: Робимо папку uploads публічною, щоб браузер міг бачити картинки
app.use('/uploads', express.static(uploadDir));

// ДОДАНО: Налаштування Multer для збереження файлів
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Генеруємо унікальне ім'я файлу (час + оригінальне розширення)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const JWT_SECRET = process.env.JWT_SECRET || 'wallish-secret-key';

const createToken = (user) => jwt.sign({
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin
}, JWT_SECRET, { expiresIn: '7d' });

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({ message: 'Требується авторизація' });
        }

        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(payload.id);

        if (!user) {
            return res.status(401).json({ message: 'Користувача не знайдено' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Невірний або прострочений токен' });
    }
};

const requireAdmin = async (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Немає доступу до адмінки' });
    }
    next();
};

// --- МАРШРУТИ ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body || {};

        if (!firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({ message: 'Усі поля обов’язкові' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Користувач з такою поштою вже існує' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            passwordHash,
            isAdmin: false
        });

        res.status(201).json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            token: createToken(user)
        });
    } catch (error) {
        res.status(500).json({ message: 'Помилка реєстрації' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ message: 'Пошта і пароль обов’язкові' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Невірна пошта або пароль' });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Невірна пошта або пароль' });
        }

        res.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            token: createToken(user)
        });
    } catch (error) {
        res.status(500).json({ message: 'Помилка входу' });
    }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
    res.json({
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        isAdmin: req.user.isAdmin
    });
});

app.get('/api/admin/check', requireAuth, requireAdmin, async (req, res) => {
    res.json({ ok: true, user: { id: req.user.id, email: req.user.email, isAdmin: true } });
});

app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'isAdmin', 'createdAt']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Не вдалося завантажити користувачів' });
    }
});

app.put('/api/users/:id/admin', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { isAdmin } = req.body || {};
        const targetUser = await User.findByPk(req.params.id);

        if (!targetUser) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }

        targetUser.isAdmin = Boolean(isAdmin);
        await targetUser.save();

        res.json({
            id: targetUser.id,
            firstName: targetUser.firstName,
            lastName: targetUser.lastName,
            email: targetUser.email,
            phone: targetUser.phone,
            isAdmin: targetUser.isAdmin
        });
    } catch (error) {
        res.status(500).json({ message: 'Не вдалося змінити права доступу' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Листівку не знайдено' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

app.post('/api/products', upload.array('images', 5), async (req, res) => {
    try {
        console.log("📦 Отримано дані:", req.body);
        console.log("📸 Отримано файли:", req.files?.length || 0, "шт.");

        const productData = { ...req.body };
        if (req.files && req.files.length > 0) {
            const urls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
            productData.imageUrl = urls[0]; 
            productData.images = urls;      
        }
        const product = await Product.create(productData);
        res.status(201).json(product);
    } catch (error) {
        console.error('❌ ПОМИЛКА СТВОРЕННЯ ТОВАРУ:', error); // Тепер помилка буде в терміналі!
        res.status(500).json({ message: 'Помилка при створенні' });
    }
});

// ОНОВИТИ існуючий товар (PUT)
app.put('/api/products/:id', upload.array('images', 5), async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Товар не знайдено' });
        
        const productData = { ...req.body };
        if (req.files && req.files.length > 0) {
            const urls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
            productData.imageUrl = urls[0];
            productData.images = urls;
        }
        await product.update(productData);
        res.json(product);
    } catch (error) {
        console.error('❌ ПОМИЛКА ОНОВЛЕННЯ ТОВАРУ:', error);
        res.status(500).json({ message: 'Помилка при оновленні' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Товар не знайдено' });
        await product.destroy();
        res.json({ message: 'Товар видалено' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка при видаленні' });
    }
});
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['parentId', 'ASC'], ['id', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Помилка завантаження категорій' });
    }
});

app.post('/api/categories', upload.single('image'), async (req, res) => {
    try {
        const categoryData = {
            name: req.body.name,
            parentId: req.body.parentId && req.body.parentId !== 'null' ? Number(req.body.parentId) : null
        };

        if (req.file) {
            categoryData.imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        const category = await Category.create(categoryData);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Помилка створення категорії' });
    }
});

app.put('/api/categories/:id', upload.single('image'), async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Категорію не знайдено' });

        const categoryData = {
            name: req.body.name,
            parentId: req.body.parentId && req.body.parentId !== 'null' ? Number(req.body.parentId) : null
        };

        if (req.file) {
            categoryData.imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        await category.update(categoryData);
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Помилка оновлення' });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (category) await category.destroy();
        res.json({ message: 'Категорію видалено' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка видалення' });
    }
});

const PORT = 5000;
const startServer = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        const adminExists = await User.findOne({ where: { email: 'admin@wallish.com' } });
        if (!adminExists) {
            const passwordHash = await bcrypt.hash('Admin123!', 10);
            await User.create({
                firstName: 'Admin',
                lastName: 'Wallish',
                email: 'admin@wallish.com',
                phone: '+380000000000',
                passwordHash,
                isAdmin: true
            });
            console.log('✅ Створено базового адміна: admin@wallish.com / Admin123!');
        }

        app.listen(PORT, () => console.log(`🚀 Бэкенд запущено на http://localhost:${PORT}`));
    } catch (error) {
        console.error('❌ Помилка:', error);
    }
};
startServer();