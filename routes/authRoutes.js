//auth routes
const express = require('express');
const { register, login, getProfile, getUsers ,getProfileById,updateUserProfile,changePassword,setAccountPrivacy} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

const multer = require('multer');
const path = require('path');
// Set up storage configuration for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify your upload directory
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original filename or customize it
    },
});

const upload = multer({ storage: storage })
router.post('/register', upload.single('image'), register);
router.post('/login', login);



// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/update', authMiddleware,upload.single('image'), updateUserProfile);
router.get('/users', authMiddleware, getUsers);
router.post('/change-password', authMiddleware,changePassword);
router.get('/users/:userId/profile', authMiddleware,getProfileById);
router.put('/:userId/privacy', authMiddleware, setAccountPrivacy);


module.exports = router;

