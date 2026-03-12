const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { postSchemas } = require('../validators/schemas');
const rateLimit = require('express-rate-limit');
const { sendNotification } = require('../socket');
const { upload } = require('../services/cloudinary');

const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per window
  message: {
    success: false,
    msg: 'Too many posts created from this IP, please try again after 15 minutes'
  }
});

router.use(postLimiter);

// @route    POST /api/posts
// @desc     Create a post
// @access   Private
router.post('/', [auth, upload.single('image'), validate(postSchemas.create)], async (req, res) => {

  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    const newPost = new Post({
      text: req.body.text.trim(),
      name: user.name,
      avatar: user.avatar,
      user: req.user.id,
      image: req.file ? req.file.path : null
    });

    const post = await newPost.save();

    res.status(201).json({
      success: true,
      msg: 'Post created successfully',
      post
    });
  } catch (err) {
    console.error('Create post error:', err.message);
    res.status(500).json({
      success: false,
      msg: 'Server error while creating post'
    });
  }
});

// @route    GET /api/posts
// @desc     Get all posts
// @access   Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Optional: Filter by user
    const filter = {};
    if (req.query.user) {
      filter.user = req.query.user;
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('user', ['name', 'avatar'])
      .populate('comments.user', ['name', 'avatar']);

    const total = await Post.countDocuments(filter);

    res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Get posts error:', err.message);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching posts'
    });
  }
});

// @route    GET /api/posts/:id
// @desc     Get post by ID
// @access   Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid post ID format'
      });
    }

    const post = await Post.findById(id)
      .populate('user', ['name', 'avatar'])
      .populate('comments.user', ['name', 'avatar']);

    if (!post) {
      return res.status(404).json({
        success: false,
        msg: 'Post not found'
      });
    }

    res.json({
      success: true,
      post
    });
  } catch (err) {
    console.error('Get post error:', err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        msg: 'Post not found'
      });
    }

    res.status(500).json({
      success: false,
      msg: 'Server error while fetching post'
    });
  }
});

// @route    PUT /api/posts/:id
// @desc     Update a post
// @access   Private
router.put('/:id', [auth, upload.single('image'), validate(postSchemas.create)], async (req, res) => {

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        msg: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        msg: 'Not authorized to update this post'
      });
    }

    // Update post
    post.text = req.body.text.trim();
    post.isEdited = true;
    post.editedAt = new Date();

    if (req.file) {
      post.image = req.file.path;
    }

    await post.save();

    res.json({
      success: true,
      msg: 'Post updated successfully',
      post
    });
  } catch (err) {
    console.error('Update post error:', err.message);
    res.status(500).json({
      success: false,
      msg: 'Server error while updating post'
    });
  }
});

// @route    DELETE /api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        msg: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        msg: 'Not authorized to delete this post'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      msg: 'Post deleted successfully'
    });
  } catch (err) {
    console.error('Delete post error:', err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        msg: 'Post not found'
      });
    }

    res.status(500).json({
      success: false,
      msg: 'Server error while deleting post'
    });
  }
});

// @route    POST /api/posts/:id/like
// @desc     Like/Unlike a post
// @access   Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        msg: 'Post not found'
      });
    }

    // Check if post is already liked by user
    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user.id
    );

    if (likeIndex > -1) {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
      await post.save();

      return res.json({
        success: true,
        msg: 'Post unliked',
        likes: post.likes,
        likesCount: post.likes.length
      });
    } else {
      // Like the post
      post.likes.unshift({ user: req.user.id });
      await post.save();

      // Send real-time notification to post owner
      if (post.user.toString() !== req.user.id) {
        sendNotification(post.user, 'LIKE', {
          senderName: 'Someone',
          postId: post._id
        });
      }

      return res.json({
        success: true,
        msg: 'Post liked',
        likes: post.likes,
        likesCount: post.likes.length
      });
    }
  } catch (err) {
    console.error('Like/Unlike post error:', err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        msg: 'Post not found'
      });
    }

    res.status(500).json({
      success: false,
      msg: 'Server error while processing like'
    });
  }
});

// @route    POST /api/posts/:id/comment
// @desc     Comment on a post
// @access   Private
router.post('/:id/comment', [auth, validate(postSchemas.comment)], async (req, res) => {

  try {
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        msg: 'Post not found'
      });
    }

    const newComment = {
      text: req.body.text.trim(),
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    };

    post.comments.unshift(newComment);
    await post.save();

    // Get the newly added comment with populated user data
    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.user', ['name', 'avatar']);

    // Send real-time notification to post owner
    if (post.user.toString() !== req.user.id) {
      sendNotification(post.user, 'COMMENT', {
        senderName: user.name,
        postId: post._id,
        text: req.body.text
      });
    }

    res.json({
      success: true,
      msg: 'Comment added successfully',
      comments: updatedPost.comments
    });
  } catch (err) {
    console.error('Add comment error:', err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        msg: 'Post not found'
      });
    }

    res.status(500).json({
      success: false,
      msg: 'Server error while adding comment'
    });
  }
});

// @route    DELETE /api/posts/:id/comment/:comment_id
// @desc     Delete a comment
// @access   Private
router.delete('/:id/comment/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        msg: 'Post not found'
      });
    }

    // Find the comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        msg: 'Comment not found'
      });
    }

    // Check if user owns the comment or the post
    if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        msg: 'Not authorized to delete this comment'
      });
    }

    // Remove comment
    post.comments = post.comments.filter(
      comment => comment.id !== req.params.comment_id
    );

    await post.save();

    res.json({
      success: true,
      msg: 'Comment deleted successfully',
      comments: post.comments
    });
  } catch (err) {
    console.error('Delete comment error:', err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        msg: 'Post not found'
      });
    }

    res.status(500).json({
      success: false,
      msg: 'Server error while deleting comment'
    });
  }
});

// @route    GET /api/posts/user/:user_id
// @desc     Get posts by user ID
// @access   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate user_id format
    if (!user_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid user ID format'
      });
    }

    const posts = await Post.find({ user: user_id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('user', ['name', 'avatar'])
      .populate('comments.user', ['name', 'avatar']);

    const total = await Post.countDocuments({ user: user_id });

    res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Get user posts error:', err.message);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching user posts'
    });
  }
});

module.exports = router;
