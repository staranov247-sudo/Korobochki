const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('product', {
    title: { type: DataTypes.STRING, allowNull: false },
    title_en: { type: DataTypes.STRING }, // НОВЕ: Назва англійською
    description: { type: DataTypes.TEXT },
    description_en: { type: DataTypes.TEXT }, // НОВЕ: Опис англійською
    price: { type: DataTypes.INTEGER, allowNull: false },
    category: { type: DataTypes.STRING },
    code: { type: DataTypes.STRING }, 
    imageUrl: { type: DataTypes.STRING }, 
    images: { 
        type: DataTypes.TEXT, 
        get() {
            const rawValue = this.getDataValue('images');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(val) {
            this.setDataValue('images', JSON.stringify(val));
        }
    }
});

module.exports = Product;