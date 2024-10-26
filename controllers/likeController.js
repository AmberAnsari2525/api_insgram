const {models} = require("../models");
const { Like, Interaction } = require('../models').models;
const { Post } = require('../models').models;
const { User } = require('../models').models;

// Add a like to a post
exports.addLike = async (req, res) => {
    const user_id = req.user.id; // Assuming the authenticated user ID is stored in req.user
    const { post_id } = req.params;

    try {
        // Check if the post exists
        const post = await Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user exists
        const user = await models.User.findOne({
            where: { id: user_id },
            attributes: ['username', 'image']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingLike = await Like.findOne({
            where: {
                post_id: post_id,
                user_id: user_id
            }
        });

        if (existingLike) {
            return res.status(400).json({ message: 'You have already liked this post.' });
        }

        // Add the like
        const like = await Like.create({ post_id, user_id });

        // Increase like count
        post.like_count = post.like_count + 1;
        await post.save();

        // Add entry to the Interaction table
        await Interaction.create({
            type: 'like',
            user_id,
            post_id
        });

        res.status(200).json({
            message: 'Post liked successfully',
            user: {
                username: user.username,
                image: user.image,
            },
            like,
            updated_like_count: post.like_count // Return the updated like count
        });
    } catch (error) {
        res.status(500).json({ message: 'Post like failed', error });
    }
};

// Get all likes for a specific post
exports.getLikesByPost = async (req, res) => {
    const { post_id } = req.params;

    try {
        const likes = await Like.findAll({ where: { post_id } });
        res.status(200).json(likes);
    } catch (error) {
        res.status(500).json({ message: 'failed get like by id', error });
    }
};

// Remove a like from a post
exports.removeLike = async (req, res) => {
    const { id } = req.params;  // Assuming you're passing the like_id as a route parameter

    if (!id) {
        return res.status(400).json({ message: 'Like ID is required' });
    }

    try {
        const like = await Like.findOne({ where: { id: id } });
        if (!like) {
            return res.status(404).json({ message: 'Like not found' });
        }

        const post = await Post.findByPk(like.post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Remove the like
        await like.destroy();

        // Decrease like count
        post.like_count = post.like_count - 1;
        await post.save();

        res.status(200).json({
            message: 'Like removed successfully',
            updated_like_count: post.like_count // Return updated like count
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove like', error });
    }
};



