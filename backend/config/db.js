const { Sequelize } = require('sequelize');

// Настраиваем SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // Файл БД появится в корне папки backend
    logging: false // Отключаем лишний спам в консоли
});

module.exports = sequelize;