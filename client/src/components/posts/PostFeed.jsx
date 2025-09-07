import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/posts');
      setPosts(res.data.posts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.response?.data?.msg || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.post('/posts', { text: newPost.trim() });
      setPosts([res.data.post, ...posts]);
      setNewPost('');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.msg || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.put(`/posts/like/${postId}`);
      setPosts(posts.map(post =>
        post._id === postId
          ? { ...post, likes: res.data.likes, likesCount: res.data.likesCount }
          : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
      setError(err.response?.data?.msg || 'Failed to like post');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="post-feed-container">
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-feed-container">
      <div className="post-feed-header">
        <h1><span className="emoji-icon">🚀</span> Developer Feed</h1>
        <p>Share your thoughts and connect with other developers</p>
        <div className="feed-stats">
          <span className="stat-badge">
            <span className="emoji-icon">📝</span> {posts.length} Posts
          </span>
          <span className="stat-badge">
            <span className="emoji-icon">👥</span> Community
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Create Post Form */}
      <div className="create-post-card">
        <div className="post-author">
          <div className="avatar-circle">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span>{user?.name}</span>
        </div>
        <form onSubmit={handleSubmitPost} className="post-form">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            rows="3"
            maxLength="1000"
          />
          <div className="post-actions">
            <span className="char-count">{newPost.length}/1000</span>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newPost.trim() || submitting}
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="no-posts">
            <h3>No posts yet</h3>
            <p>Be the first to share something with the community!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="post-card">
              <div className="post-header">
                <div className="post-author">
                  <div className="avatar-circle">
                    {post.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{post.name}</span>
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="post-content">
                <p>{post.text}</p>
                {post.image && (
                  <div className="post-image">
                    <img src={post.image} alt="Post content" />
                  </div>
                )}
              </div>

              <div className="post-actions">
                <button
                  className={`like-btn ${post.likes?.some(like => like.user === user?.id) ? 'liked' : ''}`}
                  onClick={() => handleLike(post._id)}
                >
                  <span className="emoji-icon">❤️</span> {post.likesCount || 0}
                </button>
                <button className="comment-btn">
                  <span className="emoji-icon">💬</span> {post.comments?.length || 0}
                </button>
                <button className="share-btn">
                  <span className="emoji-icon">🔗</span> Share
                </button>
              </div>

              {post.comments && post.comments.length > 0 && (
                <div className="comments-section">
                  <h4>Comments</h4>
                  {post.comments.slice(0, 3).map((comment, index) => (
                    <div key={index} className="comment">
                      <div className="comment-author">
                        <div className="avatar-circle small">
                          {comment.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="author-name">{comment.name}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  ))}
                  {post.comments.length > 3 && (
                    <p className="more-comments">
                      View all {post.comments.length} comments
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostFeed;