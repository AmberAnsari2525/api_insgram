// routes/followRoutes.js
const express = require('express');
const { followUser, unfollowUser, getFollowers, getFollowing} = require('../controllers/followController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.put('/follow/:userId', authMiddleware, followUser);
router.put('/unfollow/:userId', authMiddleware, unfollowUser);
router.get('/:userId/followers', authMiddleware, getFollowers);
router.get('/:userId/following', authMiddleware, getFollowing);

module.exports = router;
