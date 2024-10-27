const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Setup Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
    }
);

// Import all models
const User = require('./user')(sequelize, DataTypes);
const Post = require('./post')(sequelize, DataTypes);
const Comment = require('./comment')(sequelize, DataTypes);
const Like = require('./like')(sequelize, DataTypes);
const Share = require('./share')(sequelize, DataTypes);
const UserFollows = require('./UserFollows')(sequelize, DataTypes);
const Notification = require('./notification')(sequelize, DataTypes); // Import Notification model

// Call associate method on all models
User.associate({ User, Comment, UserFollows, Notification });
Comment.associate({ User });
Notification.associate({ User });

// Export the sequelize instance and models separately
module.exports = {
    sequelize,
    models: {
        User,
        Post,
        Comment,
        Like,
        Share,
        UserFollows,
        Notification, // Include Notification model
    },
};
