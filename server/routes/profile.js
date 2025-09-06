const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Import models
const User = require('../models/User');
const Profile = require('../models/Profile');

// Assume other necessary modules like `auth` middleware are defined here or imported.

// --- Helper Functions and Middleware ---

/**
 * Custom authentication middleware to protect routes.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
// Import the auth middleware instead of redefining it
const auth = require('../middleware/auth');

// Custom middleware to attach user profile to request
const attachUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                msg: 'User not found, authorization denied'
            });
        }

        req.userProfile = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, msg: 'Token expired' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, msg: 'Invalid token' });
        }
        res.status(401).json({ success: false, msg: 'Token verification failed' });
    }
};

/**
 * Validates a given ID to ensure it's a valid MongoDB ObjectId.
 * @param {string} id - The ID to validate.
 * @returns {boolean} True if the ID is valid, false otherwise.
 */
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id) && id.match(/^[0-9a-fA-F]{24}$/);
};

/**
 * Centralized error handler for common API route errors.
 * @param {object} err - The error object.
 * @param {object} res - Express response object.
 * @param {string} defaultMsg - Default error message.
 */
const handleApiError = (err, res, defaultMsg) => {
    console.error('API Error:', err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ success: false, msg: 'User not found' });
    }
    res.status(500).json({ success: false, msg: defaultMsg });
};

// --- API Routes ---

/**
 * @route POST /api/profile
 * @desc Create or update user profile
 * @access Private
 */
router.post('/', auth, async (req, res) => {
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = Array.isArray(skills)
            ? skills
            : skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update existing profile
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create new profile
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error('Profile creation error:', err.message);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
});

/**
 * @route GET /api/profile/me
 * @desc Get current user's profile
 * @access Private
 */
router.get('/me', auth, attachUserProfile, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(404).json({ success: false, msg: 'Profile not found for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error('Error fetching profile:', err.message);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
});

/**
 * @route PUT /api/profile/follow/:user_id
 * @desc Follow a user.
 * @access Private
 */
router.put('/follow/:user_id', auth, async (req, res) => {
    const { user_id } = req.params;

    if (!isValidObjectId(user_id)) {
        return res.status(400).json({ success: false, msg: 'Invalid user ID format' });
    }

    if (user_id === req.user.id) {
        return res.status(400).json({ success: false, msg: 'You can\'t follow yourself' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const [userToFollow, currentUser] = await Promise.all([
            User.findById(user_id).session(session),
            User.findById(req.user.id).session(session)
        ]);

        if (!userToFollow) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, msg: 'User to follow not found' });
        }

        if (currentUser.following.some(follow => follow.user.toString() === user_id)) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, msg: 'You are already following this user' });
        }

        currentUser.following.unshift({ user: user_id });
        userToFollow.followers.unshift({ user: req.user.id });

        await Promise.all([
            currentUser.save({ session }),
            userToFollow.save({ session })
        ]);

        await session.commitTransaction();

        res.json({
            success: true,
            msg: `You are now following ${userToFollow.name}`,
            following: { userId: userToFollow._id, name: userToFollow.name, avatar: userToFollow.avatar },
            followingCount: currentUser.following.length,
            targetFollowersCount: userToFollow.followers.length
        });

    } catch (error) {
        await session.abortTransaction();
        handleApiError(error, res, 'Server error while following user');
    } finally {
        session.endSession();
    }
});

// ---
/**
 * @route PUT /api/profile/unfollow/:user_id
 * @desc Unfollow a user.
 * @access Private
 */
router.put('/unfollow/:user_id', auth, async (req, res) => {
    const { user_id } = req.params;

    if (!isValidObjectId(user_id)) {
        return res.status(400).json({ success: false, msg: 'Invalid user ID format' });
    }

    if (user_id === req.user.id) {
        return res.status(400).json({ success: false, msg: 'You can\'t unfollow yourself' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const [userToUnfollow, currentUser] = await Promise.all([
            User.findById(user_id).session(session),
            User.findById(req.user.id).session(session)
        ]);

        if (!userToUnfollow) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, msg: 'User to unfollow not found' });
        }

        const followIndex = currentUser.following.findIndex(
            follow => follow.user.toString() === user_id
        );

        if (followIndex === -1) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, msg: 'You are not following this user' });
        }

        currentUser.following.splice(followIndex, 1);

        const followerIndex = userToUnfollow.followers.findIndex(
            follower => follower.user.toString() === req.user.id
        );
        if (followerIndex > -1) {
            userToUnfollow.followers.splice(followerIndex, 1);
        }

        await Promise.all([
            currentUser.save({ session }),
            userToUnfollow.save({ session })
        ]);

        await session.commitTransaction();

        res.json({
            success: true,
            msg: `You have unfollowed ${userToUnfollow.name}`,
            unfollowed: { userId: userToUnfollow._id, name: userToUnfollow.name, avatar: userToUnfollow.avatar },
            followingCount: currentUser.following.length,
            targetFollowersCount: userToUnfollow.followers.length
        });

    } catch (error) {
        await session.abortTransaction();
        handleApiError(error, res, 'Server error while unfollowing user');
    } finally {
        session.endSession();
    }
});

// ---
/**
 * @route GET /api/profile/followers/:user_id
 * @desc Get user's followers with pagination.
 * @access Public
 */
router.get('/followers/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        if (!isValidObjectId(user_id)) {
            return res.status(400).json({ success: false, msg: 'Invalid user ID format' });
        }

        // Optimized query to fetch a slice of followers directly
        const user = await User.findById(user_id)
            .select('followers')
            .populate({
                path: 'followers.user',
                select: 'name avatar',
                options: {
                    limit,
                    skip: (page - 1) * limit,
                    sort: { 'followedAt': -1 }
                }
            });

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        const followers = user.followers.map(follower => ({
            userId: follower.user._id,
            name: follower.user.name,
            avatar: follower.user.avatar,
            followedAt: follower.followedAt
        }));

        res.json({
            success: true,
            followers,
            pagination: {
                page,
                limit,
                total: user.followers.length,
                pages: Math.ceil(user.followers.length / limit)
            }
        });

    } catch (err) {
        handleApiError(err, res, 'Server error while fetching followers');
    }
});

// ---
/**
 * @route GET /api/profile/following/:user_id
 * @desc Get users that a user is following with pagination.
 * @access Public
 */
router.get('/following/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        if (!isValidObjectId(user_id)) {
            return res.status(400).json({ success: false, msg: 'Invalid user ID format' });
        }

        const user = await User.findById(user_id)
            .select('following')
            .populate({
                path: 'following.user',
                select: 'name avatar',
                options: {
                    limit,
                    skip: (page - 1) * limit,
                    sort: { 'followedAt': -1 }
                }
            });

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        const following = user.following.map(follow => ({
            userId: follow.user._id,
            name: follow.user.name,
            avatar: follow.user.avatar,
            followedAt: follow.followedAt
        }));

        res.json({
            success: true,
            following,
            pagination: {
                page,
                limit,
                total: user.following.length,
                pages: Math.ceil(user.following.length / limit)
            }
        });

    } catch (err) {
        handleApiError(err, res, 'Server error while fetching following');
    }
});

// ---
/**
 * @route GET /api/profile/follow-status/:user_id
 * @desc Check if current user is following another user.
 * @access Private
 */
router.get('/follow-status/:user_id', auth, async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!isValidObjectId(user_id)) {
            return res.status(400).json({ success: false, msg: 'Invalid user ID format' });
        }

        const currentUser = req.userProfile; // Use the user object attached by the auth middleware

        const isFollowing = currentUser.following.some(
            follow => follow.user.toString() === user_id
        );

        res.json({ success: true, isFollowing, userId: user_id });
    } catch (err) {
        handleApiError(err, res, 'Server error while checking follow status');
    }
});

// ---
/**
 * @route GET /api/profile/suggestions
 * @desc Get suggested users to follow.
 * @access Private
 */
router.get('/suggestions', auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const currentUser = req.userProfile; // Use the user object from the auth middleware

        const followingIds = currentUser.following.map(follow => follow.user);
        followingIds.push(req.user.id);

        const suggestions = await User.find({
            _id: { $nin: followingIds }
        })
        .select('name avatar followersCount')
        .sort({ followersCount: -1, createdAt: -1 })
        .limit(limit);

        res.json({
            success: true,
            suggestions: suggestions.map(user => ({
                userId: user._id,
                name: user.name,
                avatar: user.avatar,
                followersCount: user.followersCount
            }))
        });

    } catch (err) {
        handleApiError(err, res, 'Server error while fetching suggestions');
    }
});

module.exports = router;