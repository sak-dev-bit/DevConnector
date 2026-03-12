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
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
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

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens = [refreshToken];
    await user.save();

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
    const refreshToken = generateRefreshToken(user);

    // Filter out expired/old tokens and add new one
    // For simplicity here, we're just adding the new one. 
    // In a full implementation, you'd periodically clean this up.
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

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
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) return; // Expired or invalid anyway
          // If we find an old token being reused, it's a security risk. 
          // We could invalidate ALL tokens for that user ID.
          const hackedUser = await User.findById(decoded.user.id);
          if (hackedUser) {
            hackedUser.refreshTokens = [];
            await hackedUser.save();
          }
        }
      );
      return res.sendStatus(403); // Forbidden
    }

    const newRefreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);

    // evaluate jwt 
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err || user.id !== decoded.user.id) {
          user.refreshTokens = [...newRefreshTokens];
          await user.save();
          return res.status(403).json({ success: false, msg: 'Invalid refresh token' });
        }

        // Refresh token is valid
        const accessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Update DB with new refresh token
        user.refreshTokens = [...newRefreshTokens, newRefreshToken];
        await user.save();

        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ success: true, token: accessToken });
      }
    );
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
