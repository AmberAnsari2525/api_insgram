//auth controllers
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { models } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();

const register = async (req, res) => {
    const { username, fullName, email, password } = req.body;

    // Check if all required fields are provided
    if (!username || !fullName || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, full name, email, and password.' });
    }

    try {
        // Check if user already exists
        const userExists = await models.User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await models.User.create({
            username,
            email,
            fullName,
            password: hashedPassword,
        });

        res.status(201).json({ message: 'Successfully registered user', user });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: 'Server error while registering user', error: error.message || error });
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await models.User.findOne({ where: { email } });

        // Check if email is invalid
        if (!user) {
            return res.status(404).json({ message: 'Invalid email' });
        }

        // Check if password is invalid
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Generate token if email and password are correct
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};

//get user profile
const getProfile = async (req, res) => {
    // Get the user ID from the verified JWT token (assuming user ID is stored in req.user.id)
    const userId = req.user?.id;

    if (!userId) {
        return res.status(400).json({message: 'User ID not found'});
    }

    try {
        // Find the user by ID
        const user = await models.User.findOne({
            where: {id: userId},
            attributes: ['id', 'username', 'email', 'image', 'createdAt', 'updatedAt']
        });

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        // Return the user profile data
        return res.status(200).json({
            status: true,
            user: {
                id: user.id,
                name: user.username,
                email: user.email,

                image: `${req.protocol}://${req.get('host')}/uploads/${user.image}`,
                created_at: user.createdAt,
                updated_at: user.updatedAt
            },
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({message: 'Server error', error: error.message || error});
    }
};
//update user profile
const updateUserProfile = async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(400).json({ message: 'User ID not found' });
    }

    try {
        // Find the user by ID
        const user = await models.User.findOne({
            where: { id: userId },
            attributes: ['id', 'username', 'email', 'fullName', 'image', 'createdAt', 'updatedAt']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract form data (fields and file)
        const { username, email, fullName } = req.body;
        const image = req.file ? req.file.filename : user.image; // Check if file was uploaded

        // Update only if new data is provided
        if (username) user.username = username;
        if (email) user.email = email;
        if (fullName) user.fullName = fullName;
        user.image = image; // Update image only if file uploaded

        // Save the updated user data
        await user.save();

        // Return updated user profile
        return res.status(200).json({
            status: true,
            message: 'User profile updated successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                image: `${req.protocol}://${req.get('host')}/uploads/${user.image}`,
                created_at: user.createdAt,
                updated_at: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


//get user profile by id
const getProfileById = async (req, res) => {

    // Get userId from the request params
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({message: 'User ID is required'});
    }

    try {
        // Find the user by ID
        const user = await models.User.findOne({
            where: {id: userId},
            attributes: ['id', 'username', 'fullName' , 'image', 'createdAt', 'updatedAt']
        });

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        // Return the user profile data
        return res.status(200).json({
            status: true,
            user: {
                id: user.id,
                name: user.username,
                fullName:user.fullName,
                image: `${req.protocol}://${req.get('host')}/uploads/${user.image}`,
                created_at: user.createdAt,
                updated_at: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);

        return res.status(500).json({message: 'Server error', error: error.message || error});
    }
};



// get all user
const getUsers = async (req, res) => {
    try {
        // Fetch all users from the database except the logged-in user
        const userId = req.user.id; // Assuming req.user contains the logged-in user's ID
        const users = await models.User.findAll({
            attributes: ['id', 'username', 'email',  'image',],
            where: {
                id: { [Op.ne]: userId } // Exclude the logged-in user's data
            }
        });

        // Check if there are any users
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        // Return the list of users, excluding the logged-in user
        return res.status(200).json({
            status: true,
            users: users.map(user => ({
                id: user.id,
                name: user.username,
                email: user.email,
                image: `${req.protocol}://${req.get('host')}/uploads/${user.image}`, // Construct full image URL here

            }))
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Server error', error: error.message || error });
    }
};



const changePassword = async (req, res) => {
    const {oldPassword, newPassword} = req.body;
    const userId = req.user?.id; // Ensure req.user is defined

    if (!userId) {
        return res.status(401).json({message: 'Unauthorized'}); // User not authenticated
    }

    try {
        const user = await models.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        // Check if old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({message: 'Old password is incorrect'});
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({message: 'Password has been changed successfully'});
    } catch (error) {
        console.error('Error changing password:', error); // Log the error for debugging
        res.status(500).json({message: 'Server error', error: error.message}); // Include error message
    }
};


module.exports = {
    register,
    login,
    getProfile,
    getUsers,
    getProfileById,
    updateUserProfile,
    changePassword,

};
