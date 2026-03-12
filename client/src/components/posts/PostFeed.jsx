import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const SkeletonPost = () => (
  <div className="post-card" style={{ padding: 'var(--space-4)' }}>
    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
      <div className="skeleton skeleton-circle" style={{ width: 40, height: 40 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: '25%', height: 11 }} />
      </div>
    </div>
    <div className="skeleton" style={{ width: '100%', height: 14, marginBottom: 6 }} />
    <div className="skeleton" style={{ width: '80%', height: 14 }} />
  </div>
);

const PostFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const textareaRef = useRef();

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/posts');
      setPosts(res.data.posts || []);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('text', newPost.trim());
      const res = await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPosts(prev => [res.data.post, ...prev]);
      setNewPost('');
      toast.success('Post published!');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to publish post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      setPosts(prev => prev.map(p =>
        p._id === postId ? { ...p, likes: res.data.likes } : p
      ));
    } catch { toast.error('Could not update like'); }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    try {
      const res = await api.post(`/posts/${postId}/comment`, { text });
      setPosts(prev => prev.map(p =>
        p._id === postId ? { ...p, comments: res.data.comments } : p
      ));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch { toast.error('Could not add comment'); }
  };

  const isLiked = (post) =>
    post.likes?.some(l => (l.user?._id || l.user)?.toString() === user?.id);

  return (
    <div>
      {/* Create post */}
      <div className="create-post dc-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="create-post__top">
          <div className={`dc-avatar dc-avatar--md`}>
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} />
              : user?.name?.charAt(0)}
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.name}</span>
        </div>
        <form onSubmit={handleSubmitPost}>
          <textarea
            ref={textareaRef}
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="What's on your mind? Share code, ideas, questions..."
            rows={3}
            maxLength={1000}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmitPost(e); }}
          />
          <div className="create-post__bottom">
            <span className="char-count" style={{ color: newPost.length > 900 ? 'var(--danger)' : undefined }}>
              {newPost.length}/1000
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ctrl+Enter to post</span>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!newPost.trim() || submitting}
              >
                {submitting
                  ? <><div className="dc-spinner dc-spinner--sm" style={{ borderTopColor: '#fff' }}></div> Posting...</>
                  : '📤 Post'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Feed */}
      {loading
        ? [1, 2, 3].map(k => <SkeletonPost key={k} />)
        : posts.length === 0 ? (
          <div className="no-posts">
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🚀</div>
            <h3>No posts yet</h3>
            <p>Be the first to share something with the community!</p>
          </div>
        ) : posts.map(post => {
          const liked = isLiked(post);
          const comments = post.comments || [];
          const showAll = expandedComments[post._id];
          const visibleComments = showAll ? comments : comments.slice(0, 2);
          return (
            <div key={post._id} className="post-card">
              <div className="post-card__header">
                <div className="dc-avatar dc-avatar--md">
                  {post.avatar
                    ? <img src={post.avatar} alt={post.name} />
                    : post.name?.charAt(0)}
                </div>
                <div className="post-card__meta">
                  <div className="post-card__author">{post.name}</div>
                  <div className="post-card__time">{timeAgo(post.createdAt)}{post.isEdited && ' · edited'}</div>
                </div>
              </div>

              <div className="post-card__body">
                <p className="post-card__text">{post.text}</p>
                {post.image && (
                  <div className="post-card__image">
                    <img src={post.image} alt="Post" />
                  </div>
                )}
              </div>

              <div className="post-card__actions">
                <button
                  className={`post-card__action-btn ${liked ? 'liked' : ''}`}
                  onClick={() => handleLike(post._id)}
                  title={liked ? 'Unlike' : 'Like'}
                >
                  <span className="like-icon">{liked ? '❤️' : '🤍'}</span>
                  {post.likes?.length || 0}
                </button>
                <button className="post-card__action-btn" title="Comments">
                  💬 {comments.length}
                </button>
              </div>

              {/* Comments */}
              {comments.length > 0 && (
                <div className="comments-section">
                  {visibleComments.map(comment => (
                    <div key={comment._id || comment.id} className="comment-item">
                      <div className="dc-avatar dc-avatar--sm">
                        {comment.avatar
                          ? <img src={comment.avatar} alt={comment.name} />
                          : comment.name?.charAt(0)}
                      </div>
                      <div className="comment-item__body">
                        <div className="comment-item__header">
                          <span className="comment-item__author">{comment.name}</span>
                          {comment.createdAt && <span className="comment-item__time">{timeAgo(comment.createdAt)}</span>}
                        </div>
                        <div className="comment-item__text">{comment.text}</div>
                      </div>
                    </div>
                  ))}
                  {comments.length > 2 && !showAll && (
                    <button className="comments-more" onClick={() => setExpandedComments(prev => ({ ...prev, [post._id]: true }))}>
                      View all {comments.length} comments
                    </button>
                  )}
                </div>
              )}

              {/* Add comment */}
              <div className="add-comment-form">
                <div className="dc-avatar dc-avatar--sm">
                  {user?.avatar ? <img src={user.avatar} alt={user.name} /> : user?.name?.charAt(0)}
                </div>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInputs[post._id] || ''}
                  onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post._id); }}
                />
                <button
                  type="button"
                  onClick={() => handleAddComment(post._id)}
                  disabled={!commentInputs[post._id]?.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          );
        })
      }
    </div>
  );
};

export default PostFeed;