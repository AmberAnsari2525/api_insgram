const { Post, User, Like } = require('../models').models;
const { Op } = require('sequelize');

//create post
// Create post
exports.createPost = async (req, res) => {
    const { content, post_type } = req.body; // Removed count_likes since it was not used

    try {
        const errors = {};

        // Validate inputs here (if necessary)
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        const user_id = req.user.id;

        // Get the uploaded files
        const media_links = req.files ? req.files.map(file => `${file.filename}`) : [];

        // Store media links as a JSON string
        const media_link = JSON.stringify(media_links); // Serialize to JSON string

        // Create the post
        const newPost = await Post.create({
            content,
            post_type,
            media_link, // Store media links as a JSON string
            user_id,
            like_count: 0, // Initialize like count if needed
        });

        // Return the post along with a success message
        res.status(200).json({
            message: 'Post created successfully',
            post: newPost,
        });
    } catch (error) {
        console.error('Post creation failed:', error);
        res.status(500).json({
            message: 'Post creation failed',
            error: error.message || 'Unknown error occurred',
        });
    }
};


// Get all posts
exports.getPosts = async (req, res) => {
    try {
        const userId = req.user.id; // Current user ID
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Fetch current user's privacy setting
        const currentUser = await User.findByPk(userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        let whereCondition = {};

        if (currentUser.isPrivate) {
            // If the account is private, fetch the IDs of the users that the current user is following
            const following = await models.UserFollows.findAll({
                where: { followerId: userId },
                attributes: ['followedId'],
            });

            const followingIds = following.map(follow => follow.followedId);
            followingIds.push(userId); // Include the current user's own posts

            if (followingIds.length === 0) {
                return res.status(200).json({
                    currentPage: page,
                    totalPages: 0,
                    totalPosts: 0,
                    posts: [],
                });
            }

            // Only include posts from the users that the current user is following
            whereCondition = { user_id: { [Op.in]: followingIds } };
        }

        // Fetch posts along with user details
        const { count, rows: posts } = await Post.findAndCountAll({
            where: whereCondition,
            limit: limit,
            offset: offset,
            include: [{
                model: User,
                as: 'User', // Use the alias defined in the association
                attributes: ['username', 'fullName', 'image'], // Include desired user fields
            }],
        });

        // Format posts for response
        const formattedPosts = posts.map(post => {
            let mediaLinks = [];
            try {
                mediaLinks = post.media_link ? JSON.parse(post.media_link) : [];
            } catch (err) {
                console.error('Error parsing media_link for post:', post.id, err);
                mediaLinks = [];
            }

            const fullMediaLinks = mediaLinks.map(link => `${req.protocol}://${req.get('host')}/uploads/${link}`);

            return {
                id: post.id,
                user_id: post.user_id,
                post_type: post.post_type,
                content: post.content,
                media_links: fullMediaLinks,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                username: post.User ? post.User.username : null, // Safely access user information
                fullName: post.User ? post.User.fullName : null,
                user_image: post.User && post.User.image ? `${req.protocol}://${req.get('host')}/uploads/${post.User.image}` : null,
                like_count: post.like_count || 0, // Placeholder
                comment_count: post.comment_count || 0 // Include comment count
            };
        });

        const totalPages = Math.ceil(count / limit);
        res.status(200).json({
            currentPage: page,
            totalPages: totalPages,
            totalPosts: count,
            posts: formattedPosts,
        });
    } catch (error) {
        console.error('Failed to retrieve posts:', error.message || error);
        res.status(500).json({
            message: 'Failed to retrieve posts',
            error: error.message || 'An unknown error occurred',
        });
    }
};




//get post by id

exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Fetch user information, including full name, username, and image
        const user = await User.findByPk(post.user_id, {
            attributes: ['username', 'fullName', 'image'],
        });

        let mediaLinks = [];
        try {
            mediaLinks = post.media_link ? JSON.parse(post.media_link) : [];
        } catch (err) {
            console.error('Error parsing media_link for post:', post.id, err);
            mediaLinks = [];
        }

        const fullMediaLinks = mediaLinks.map(link => `${req.protocol}://${req.get('host')}/uploads/${link}`);
        const likeCount = await Like.count({ where: { post_id: post.id } });

        const formattedPost = {
            id: post.id,
            user_id: post.user_id,
            post_type: post.post_type,
            content: post.content,
            media_links: fullMediaLinks,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            username: user.username,
            fullName: user.fullName,  // Include the full name
            user_image: user ? `${req.protocol}://${req.get('host')}/uploads/${user.image}` : null,
            like_count: likeCount,
            comment_count: post.comment_count || 0 // Include comment count
        };

        res.status(200).json(formattedPost);
    } catch (error) {
        console.error('Failed to retrieve post:', error.message || error);
        res.status(500).json({
            message: 'Failed to retrieve post',
            error: error.message || error
        });
    }
};


// Get posts by user ID
// Get posts by user ID
exports.getPostsByUserId = async (req, res) => {
    const { user_id } = req.params; // Assuming user_id is passed in the URL params

    try {
        // Find all posts where the user_id matches the provided ID
        const posts = await Post.findAll({
            where: { user_id },
            include: [{
                model: User,
                as: 'User', // Use the same alias as defined in the Post model association
                attributes: ['username', 'fullName', 'image'],
            }],
        });

        // If no posts are found, return a 404 status
        if (posts.length === 0) {
            return res.status(404).json({ message: 'No posts found for this user' });
        }

        // Format the posts to include user information
        const formattedPosts = posts.map(post => {
            let mediaLinks = [];
            try {
                mediaLinks = post.media_link ? JSON.parse(post.media_link) : [];
            } catch (err) {
                console.error('Error parsing media_link for post:', post.id, err);
                mediaLinks = [];
            }

            const fullMediaLinks = mediaLinks.map(link => `${req.protocol}://${req.get('host')}/uploads/${link}`);

            return {
                id: post.id,
                user_id: post.user_id,
                post_type: post.post_type,
                content: post.content,
                media_links: fullMediaLinks,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                username: post.User ? post.User.username : null, // Safely access user information
                fullName: post.User ? post.User.fullName : null,
                user_image: post.User && post.User.image ? `${req.protocol}://${req.get('host')}/uploads/${post.User.image}` : null,
                like_count: post.like_count || 0, // Placeholder for like count, if needed
                comment_count: post.comment_count || 0

            };
        });

        // Return the found posts with user details
        res.status(200).json(formattedPosts);
    } catch (error) {
        console.error("Error fetching user's posts:", error);
        res.status(500).json({ message: 'Failed to retrieve posts', error });
    }
};

// Update a post by ID

exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const { content, post_type } = req.body;

    try {
        const post = await Post.findByPk(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Update post content and post type if provided
        if (content) post.content = content;
        if (post_type) post.post_type = post_type;

        // Handle uploaded media files
        if (req.files && req.files.length > 0) {
            const media_links = req.files.map(file => `${file.filename}`);
            post.media_link = JSON.stringify(media_links); // Store media links as JSON
        }

        // Save the updated post
        await post.save();
        console.log('Updated Post Data:', post);

        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        console.error('Failed to update post:', error);
        res.status(500).json({ message: 'Failed to update post', error: error.message || error });
    }
};


// Delete a post by ID
exports.deletePost = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findByPk(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        await post.destroy();
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Failed to delete post:', error);
        res.status(500).json({ message: 'Failed to delete post', error });
    }
};