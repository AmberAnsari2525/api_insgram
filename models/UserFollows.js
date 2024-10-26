// models/UserFollows.js

module.exports = (sequelize, DataTypes) => {
    const UserFollows = sequelize.define('UserFollows', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        followerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // Reference to Users table
                key: 'id',
            },
            onDelete: 'CASCADE', // If user is deleted, remove their follows
        },
        followedId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // Reference to Users table
                key: 'id',
            },
            onDelete: 'CASCADE', // If followed user is deleted, remove their follows
        },
    }, {
        tableName: 'user_follows', // Specify table name in the database
        timestamps: true, // To add createdAt and updatedAt timestamps
    });

    UserFollows.associate = (models) => {
        // Define associations if necessary
        UserFollows.belongsTo(models.User, {
            foreignKey: 'followerId',
            as: 'follower',
        });
        UserFollows.belongsTo(models.User, {
            foreignKey: 'followedId',
            as: 'followed',
        });
    };

    return UserFollows;
};
