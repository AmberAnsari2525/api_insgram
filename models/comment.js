// models/Comment.js
module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        parent_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Comments',
                key: 'id',
            },
            onDelete: 'CASCADE',
            allowNull: true,
            defaultValue: null,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        tableName: 'comments',
    });

    Comment.associate = (models) => {
        Comment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return Comment;
};
