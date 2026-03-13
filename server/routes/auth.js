const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const { authSchemas } = require('../validators/schemas');

// Environment validation
if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('JWT_SECRET and REFRESH_TOKEN_SECRET environment variables are required');
}

// Token helper functions
const generateAccessToken = (user) => {
  if (!process.env.JWT_SECRET) console.error('JWT_SECRET IS MISSING!');
  return jwt.sign(
    { user: { id: user.id, email: user.email } },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { user: { id: user.id } },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased from 20 to 100 attempts
  message: {
    success: false,
    msg: 'Too many authentication attempts, please try again later'
  }
});

router.use(authLimiter);

// @route    POST /api/auth/register
// @desc     Register user
// @access   Public
router.post('/register', validate(authSchemas.register), async (req, res) => {
  console.log('Registration attempt:', { name: req.body.name, email: req.body.email, passwordLength: req.body.password?.length });

  const { name, email, password } = req.body;

  try {
    console.log('Checking for existing user...');
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({
        success: false,
        msg: 'User already exists with this email'
      });
    }

    user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password
    });

    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);

    console.log('Generating tokens...');
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens = [refreshToken];
    
    console.log('Saving user...');
    await user.save();
    console.log('User saved successfully');

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

    console.log('Registration response sent for:', email);

  } catch (err) {
    console.error('Registration error:', err.message);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        msg: 'User already exists'
      });
    }

    res.status(500).json({
      success: false,
      msg: 'Server error during registration'
    });
  }
});

// @route    POST /api/auth/login
// @desc     Login user
// @access   Public
router.post('/login', validate(authSchemas.login), async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: 'Invalid credentials'
      });
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Atomic update to avoid VersionError
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: newRefreshToken }
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    console.log('Login successful:', { id: user.id, email: user.email });

    res.json({
      success: true,
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({
      success: false,
      msg: 'Server error during login'
    });
  }
});

// @route    POST /api/auth/refresh
// @desc     Refresh access token
// @access   Public (via Refresh Token Cookie)
router.post('/refresh', async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.status(401).json({ success: false, msg: 'No refresh token' });
  const refreshToken = cookies.refreshToken;

  try {
    const user = await User.findOne({ refreshTokens: refreshToken });

    // Detected refresh token reuse!
    if (!user) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        // Token is valid but not in DB — possible token theft. Invalidate all tokens for that user.
        await User.findByIdAndUpdate(decoded.user.id, { $set: { refreshTokens: [] } });
      } catch (e) {
        // Token is expired/invalid anyway — ignore
      }
      return res.status(403).json({ success: false, msg: 'Forbidden' });
    }

    // Verify the JWT synchronously
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (e) {
      // Token expired or invalid — remove it from user's tokens
      await User.findByIdAndUpdate(user._id, { $pull: { refreshTokens: refreshToken } });
      return res.status(403).json({ success: false, msg: 'Invalid refresh token' });
    }

    if (user.id !== decoded.user.id) {
      await User.findByIdAndUpdate(user._id, { $pull: { refreshTokens: refreshToken } });
      return res.status(403).json({ success: false, msg: 'Invalid refresh token' });
    }

    // Refresh token is valid — rotate it
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Atomic update: remove old token, add new one (avoids VersionError)
    await User.findByIdAndUpdate(user._id, {
      $pull: { refreshTokens: refreshToken },
    });
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: newRefreshToken },
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, token: accessToken });
  } catch (err) {
    console.error('Refresh token error:', err.message);
    res.status(500).json({ success: false, msg: 'Server error during refresh' });
  }
});

// @route    POST /api/auth/logout
// @desc     Logout user & invalidate refresh token
// @access   Public
router.post('/logout', async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    return res.status(204).json({ success: true }); // No content
  }
  const refreshToken = cookies.refreshToken;

  try {
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
      await user.save();
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    res.json({ success: true, msg: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ success: false, msg: 'Server error during logout' });
  }
});

// @route    GET /api/auth
// @desc     Get logged in user
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        followersCount: user.followersCount,
        followingCount: user.followingCount
      }
    });
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({
      success: false,
      msg: 'Server error'
    });
  }
});

module.exports = router;
