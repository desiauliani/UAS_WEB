const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Inisialisasi Model
db.User = require('./User')(sequelize, DataTypes);
db.Category = require('./Category')(sequelize, DataTypes);
db.Product = require('./Product')(sequelize, DataTypes);
db.Order = require('./Order')(sequelize, DataTypes);
db.OrderDetail = require('./OrderDetail')(sequelize, DataTypes);
db.Review = require('./Review')(sequelize, DataTypes);

// Definisi Relasi Wajib (Sesuai Permintaan)
// User & Order
db.User.hasMany(db.Order, { foreignKey: 'userId', as: 'orders' });
db.Order.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// User & Review
db.User.hasMany(db.Review, { foreignKey: 'userId', as: 'reviews' });
db.Review.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Category & Product
db.Category.hasMany(db.Product, { foreignKey: 'categoryId', as: 'products' });
db.Product.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

// Order & OrderDetail
db.Order.hasMany(db.OrderDetail, { foreignKey: 'orderId', as: 'orderDetails' });
db.OrderDetail.belongsTo(db.Order, { foreignKey: 'orderId', as: 'order' });

// Product & OrderDetail
db.Product.hasMany(db.OrderDetail, { foreignKey: 'productId', as: 'orderDetails' });
db.OrderDetail.belongsTo(db.Product, { foreignKey: 'productId', as: 'product' });

// Product & Review
db.Product.hasMany(db.Review, { foreignKey: 'productId', as: 'reviews' });
db.Review.belongsTo(db.Product, { foreignKey: 'productId', as: 'product' });

module.exports = db;