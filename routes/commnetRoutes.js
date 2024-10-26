const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {getAllComments ,getCommentsByPost, createComment, updateComment, deleteComment} = require("../controllers/commentController");
const router = express.Router();

router.post('/posts/:post_id/comments', authMiddleware, createComment);

router.get('/comments', authMiddleware, getAllComments );
router.get('/posts/:post_id/comments', authMiddleware, getCommentsByPost);
router.put('/comments/:comment_id', authMiddleware, updateComment);
router.delete('/comments/:comment_id', authMiddleware, deleteComment);

module.exports = router;
