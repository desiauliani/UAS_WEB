module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Order', {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        total: { type: DataTypes.INTEGER, allowNull: false },
        status: { 
            type: DataTypes.ENUM('Pending', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'), 
            defaultValue: 'Pending' 
        },
        metode_pembayaran: { type: DataTypes.STRING, allowNull: false },
        bukti_bayar: { type: DataTypes.STRING }
    }, {
        tableName: 'orders',
        timestamps: true
    });
};