const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  company: {
    type: String,
    maxlength: 100
  },
  website: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  location: {
    type: String,
    maxlength: 100
  },
  status: {
    type: String,
    required: true,
    maxlength: 50
  },
  skills: [{
    type: String,
    maxlength: 50
  }],
  githubusername: {
    type: String,
    maxlength: 50
  },
  bio: {
    type: String,
    maxlength: 500
  },
  social: {
    twitter: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Twitter URL must be valid'
      }
    },
    facebook: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Facebook URL must be valid'
      }
    },
    linkedin: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'LinkedIn URL must be valid'
      }
    },
    youtube: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'YouTube URL must be valid'
      }
    },
    instagram: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Instagram URL must be valid'
      }
    }
  },
  // Additional profile settings
  isPrivate: {
    type: Boolean,
    default: false
  },
  allowFollowRequests: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
ProfileSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Profile', ProfileSchema);
