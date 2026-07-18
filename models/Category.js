module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Category', {
        nama: { type: DataTypes.STRING, allowNull: false }
    }, {
        tableName: 'categories',
        timestamps: true
    });
};