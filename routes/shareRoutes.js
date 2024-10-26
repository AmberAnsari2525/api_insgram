const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {addShare, getAllShare, removeShare} = require("../controllers/shareController");

const router = express.Router();

router.post('/posts/:postId/shares', authMiddleware, addShare);


module.exports = router;