const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    imageUrl: {
        type: DataTypes.STRING
    }
});

module.exports = Category;