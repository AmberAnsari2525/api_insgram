const {models} = require("../models");
const {Comment, Interaction} = require('../models/').models;
const {Post} = require('../models').models;
const {User} = require('../models').models;

exports.createComment = async (req, res) => {
    const { comment, parent_id } = req.body;
    const user_id = req.user.id;
    const { post_id } = req.params;

    try {
        if (!comment) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const user = await models.User.findOne({
            where: { id: user_id },
            attributes: ['username', 'image']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const post = await models.Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (parent_id) {
            const parentComment = await models.Comment.findByPk(parent_id);
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
        }

        const newComment = await models.Comment.create({ post_id, user_id, comment, parent_id });

        // Increment the comment count
        post.comment_count = post.comment_count + 1;
        await post.save();

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${user.image}`;

        res.status(200).json({
            message: 'Comment added successfully',
            user: {
                id: user.id,
                username: user.username,
                image: imageUrl,
            },
            comment: newComment,
        });
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({
            message: 'Comment creation failed',
            error: error.message || 'Unknown error',
        });
    }
};

//get all comment by all posts
exports.getAllComments = async (req, res) => {
    try {
        const comments = await Comment.findAll();
        if (comments.length === 0) {
            return res.status(404).json({ message: 'No comments found' });
        }
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'failed  get comments', error });
    }
};

exports.getCommentsByPost = async (req, res) => {
    const { post_id } = req.params;

    try {
        console.log('Post ID:', post_id);

        const comments = await Comment.findAll({
            where: { post_id },
            include: [{
                model: User,
                as: 'user', // This should match the alias you defined in the association
                attributes: ['username', 'image'],
            }]
        });


        if (comments.length === 0) {
            return res.status(404).json({ message: 'No comments found for this post' });
        }

        const formattedComments = comments.map(comment => ({
            id: comment.id,
            content: comment.comment,
            post_id: comment.post_id,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            user: {
                username: comment.user.username,
                image: `${req.protocol}://${req.get('host')}/uploads/${comment.user.image}`,
            }
        }));

        res.status(200).json(formattedComments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Failed to get comments for this post', error: error.message });
    }
};

// Update a comment by ID
exports.updateComment = async (req, res) => {
    const { comment_id } = req.params;
    const { comment } = req.body;

    try {
        const existingComment = await Comment.findByPk(comment_id);
        if (!existingComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Update the comment
        existingComment.comment = comment || existingComment.comment;
        await existingComment.save();

        res.status(200).json({ message: 'Comment updated successfully', comment: existingComment });
    } catch (error) {
        res.status(500).json({ message: 'failed  update comments', error });
    }
};

// Delete a comment by ID
exports.deleteComment = async (req, res) => {
    const { comment_id } = req.params;

    try {
        const comment = await Comment.findByPk(comment_id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Decrement the comment count for the post
        const post = await Post.findByPk(comment.post_id);
        if (post) {
            post.comment_count = Math.max(0, post.comment_count - 1); // Prevent negative count
            await post.save();
        }

        await comment.destroy();
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete comment', error });
    }
};


