// controllers/followController.js
const { Op } = require('sequelize');
const { models } = require('../models');

// Follow User


// Follow User

const followUser = async (req, res) => {
    const userIdToFollow = req.params.userId; // Get the user ID to follow from the request parameters
    const currentUserId = req.user.id; // Get the current user's ID from the request object

    // Check if the user is trying to follow themselves
    if (userIdToFollow === currentUserId) {
        return res.status(400).json({ message: 'Ap khud ko follow nahi kar sakte' });
    }

    try {
        // Check if the user to be followed exists
        const followedUser = await models.User.findByPk(userIdToFollow);
        if (!followedUser) {
            return res.status(404).json({ message: 'User nahi mila' });
        }

        // Check if already following
        const alreadyFollowing = await models.UserFollows.findOne({
            where: { followerId: currentUserId, followedId: userIdToFollow },
        });
        if (alreadyFollowing) {
            return res.status(400).json({ message: 'Aap pehle se is user ko follow karte hain' });
        }

        // Create a new follow record
        await models.UserFollows.create({
            followerId: currentUserId,
            followedId: userIdToFollow,
        });

        // Update follower and following counts
        await models.User.increment('followingCount', { where: { id: currentUserId } });
        await models.User.increment('followersCount', { where: { id: userIdToFollow } });

        // Create a notification for the follow action
        await models.Notification.create({
            user: userIdToFollow, // The user receiving the notification
            type: 'follow', // Notification type
            sourceUser: currentUserId, // The user who followed
            post: null, // Set to null as this is not related to a post
        });

        // Send success response
        res.status(201).json({ message: 'User successfully followed' });
    } catch (error) {
        console.error('User follow error:', error);
        // Send error response
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Unfollow User
const unfollowUser = async (req, res) => {
    const userIdToUnfollow = req.params.userId;
    const currentUserId = req.user.id;

    try {
        const unfollowed = await models.UserFollows.destroy({
            where: { followerId: currentUserId, followedId: userIdToUnfollow },
        });

        if (!unfollowed) {
            return res.status(404).json({ message: 'You are not following this user' });
        }

        // Update follower and following counts
        await models.User.decrement('followingCount', { where: { id: currentUserId } });
        await models.User.decrement('followersCount', { where: { id: userIdToUnfollow } });

        // Optional: Create a notification for unfollow action
        await models.Notification.create({
            user: userIdToUnfollow, // The user receiving the notification
            type: 'unfollow', // Notification type for unfollow
            sourceUser: currentUserId, // The user who unfollowed
            post: null, // Set to null since it is not related to a post
        });

        res.status(200).json({ message: 'Successfully unfollowed the user' });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



// Get followers list
const getFollowers = async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await models.User.findByPk(userId, {
            include: [
                {
                    model: models.User,
                    as: 'followers',
                    attributes: ['id', 'username', 'fullName'], // Choose fields to include
                },
            ],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.followers);
    } catch (error) {
        console.error('Error fetching followers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get following list
const getFollowing = async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await models.User.findByPk(userId, {
            include: [
                {
                    model: models.User,
                    as: 'following',
                    attributes: ['id', 'username', 'fullName'],
                },
            ],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.following); // Return following list
    } catch (error) {
        console.error('Error fetching following list:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
};