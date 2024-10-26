const {Share, Interaction} = require('../models').models;
const {Post} = require('../models').models;
const {User} = require('../models').models;

// Add a like to a post
exports.addShare = async (req, res) => {
    const user_id = req.user.id; // Get the authenticated user's ID
    const post_id = req.params.postId; // Get post_id from the route parameter

    console.log('Share Model:', Share); // Add this line to check the Share model

    try {
        // Check if the post exists
        const post = await Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create the share entry
        const share = await Share.create({ post_id, user_id }); // Error might occur here if Share is undefined

        // Create an interaction entry
        await Interaction.create({
            type: 'share',
            user_id,
            post_id
        });

        res.status(200).json({
            message: 'Post shared successfully',
            share,
        });
    } catch (error) {
        console.error('Failed to share post:', error.message || error);
        res.status(500).json({ message: 'Post sharing failed', error: error.message || error });
    }
};



