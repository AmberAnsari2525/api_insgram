const express = require('express');
const { sequelize} = require ('./models');
const authRoutes = require ('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commnetRoutes');
const likeRoutes = require('./routes/likeRoutes');
const shareRoutes = require('./routes/shareRoutes');
const followRoutes = require('./routes/followRoutes');
const notificationRoutes = require('./routes/notificationsRoutes');
const storyRoutes=require('./routes/storyRoutes')
require('dotenv').config();
const app = express();

//Body parser middleware to parse incoming JSON requests

app.use(express.json());

//Use the auth route routes for `api/auth`
app.use('/api/auth', authRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);
app.use('/api', likeRoutes);
app.use('/api', shareRoutes);
app.use('/api', followRoutes);
app.use('/api', notificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api',storyRoutes);
const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
})