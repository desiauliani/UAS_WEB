module.exports = (sequelize, DataTypes) => {
    return sequelize.define('User', {
        nama: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        role: { type: DataTypes.ENUM('admin', 'customer'), defaultValue: 'customer' }
    }, {
        tableName: 'users',
        timestamps: true
    });
};