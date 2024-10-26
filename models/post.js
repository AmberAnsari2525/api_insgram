module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        post_type: {
            type: DataTypes.ENUM('text', 'image', 'video', 'link'),
            allowNull: false,
            defaultValue: 'text',
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        media_link: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        like_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0, // Start with 0 likes
            allowNull: false,
        },
    });
    return Post;
};