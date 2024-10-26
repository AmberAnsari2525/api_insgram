const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { createPost, getPosts, getPostsByUserId, updatePost, deletePost,getPostById } = require("../controllers/postController");
const router = express.Router();
const multer = require('multer');
// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + require('path').extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage });
// Define routes
router.post('/posts', upload.array('media_link'), authMiddleware, createPost);
router.get('/posts', authMiddleware, getPosts);

// // Get a post by ID
router.get('/posts/:id', authMiddleware, getPostById);
// // Get posts by user ID
router.get('/user/:user_id/posts', authMiddleware, getPostsByUserId);
//Update a post by ID
router.put('/posts/:id', upload.array('media_link'), authMiddleware, updatePost);
router.delete('/posts/:id', authMiddleware, deletePost);

module.exports = router;