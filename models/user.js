// models/User.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        followersCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        followingCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        // New field for privacy setting
        isPrivate: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, // Default to public
        },
    }, {
        tableName: 'users',
    });

    User.associate = (models) => {
        User.belongsToMany(models.User, {
            through: models.UserFollows,
            as: 'followers',
            foreignKey: 'followedId',
            otherKey: 'followerId',
        });

        User.belongsToMany(models.User, {
            through: models.UserFollows,
            as: 'following',
            foreignKey: 'followerId',
            otherKey: 'followedId',
        });

    };

    return User;
};
