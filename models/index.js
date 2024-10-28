// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
    }
);

const User = require('./user')(sequelize, DataTypes);
const Post = require('./post')(sequelize, DataTypes);
const Comment = require('./comment')(sequelize, DataTypes);
const Like = require('./like')(sequelize, DataTypes);
const Share = require('./share')(sequelize, DataTypes);
const UserFollows = require('./UserFollows')(sequelize, DataTypes);
const Notification = require('./notification')(sequelize, DataTypes);
const Story = require('./story')(sequelize, DataTypes);

User.associate({ User, Comment, UserFollows, Notification, Story });
Comment.associate({ User });
Notification.associate({ User });
Story.associate({ User });

module.exports = {
    sequelize,
    models: {
        User,
        Post,
        Comment,
        Like,
        Share,
        UserFollows,
        Notification,
        Story,
    },
};
