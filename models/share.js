module.exports = (sequelize, DataTypes) => {
    const Share = sequelize.define('Share', {
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'shares', // Explicitly set the table name
    });

    return Share;
};
