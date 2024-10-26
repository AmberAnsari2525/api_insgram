const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {addLike, getLikesByPost, removeLike} = require("../controllers/likeController");

const router = express.Router();

router.post('/posts/:post_id/likes', authMiddleware, addLike);
router.get('/posts/:post_id/likes', authMiddleware, getLikesByPost);
router.delete('/likes/:id', authMiddleware, removeLike);

module.exports = router;