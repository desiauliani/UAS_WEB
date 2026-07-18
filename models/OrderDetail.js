module.exports = (sequelize, DataTypes) => {
    return sequelize.define('OrderDetail', {
        orderId: { type: DataTypes.INTEGER, allowNull: false },
        productId: { type: DataTypes.INTEGER, allowNull: false },
        qty: { type: DataTypes.INTEGER, allowNull: false },
        subtotal: { type: DataTypes.INTEGER, allowNull: false }
    }, {
        tableName: 'order_details',
        timestamps: true
    });
};