import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import { Heart, Bookmark, MessageCircle, ThumbsUp, Award, Lightbulb, Trash2 } from 'lucide-react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[${new Date().toISOString()}] ErrorBoundary caught in Bookmarks:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-400 text-center p-2 sm:p-4 font-sans text-base sm:text-lg">
          Something went wrong in Bookmarks. Please refresh the page or try again later.
        </div>
      );
    }
    return this.props.children;
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const PostCard = ({ post, myId, token, handleLike, handleBookmark, handleComment, handlePollVote, handleDelete }) => (
  <motion.div
    variants={itemVariants}
    className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl sm:rounded-3xl p-2 sm:p-4 mb-2 sm:mb-4 shadow-md sm:shadow-xl border-t-2 sm:border-t-4 border-secondary transition-all duration-300 hover:shadow-lg sm:hover:shadow-2xl"
  >
    <div className="flex items-center justify-between mb-1 sm:mb-2">
      <p className="font-semibold text-accent flex items-center gap-1 sm:gap-2">
        <span className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-accent/30 flex items-center justify-center text-accent font-bold text-sm sm:text-xl">
          {post.author?.name?.[0] || '?'}
        </span>
        {post.author?.name || 'Unknown User'}
      </p>
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs sm:text-sm text-gray-500">
          {new Date(post.createdAt).toLocaleString()}
        </span>
        {post.author?._id === myId && (
          <button
            onClick={() => handleDelete(post._id)}
            className="text-red-400 hover:text-red-600 transition"
            title="Delete Post"
          >
            <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
          </button>
        )}
      </div>
    </div>
    <p className="text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">{post.content}</p>
    <p className="text-xs sm:text-sm text-secondary font-semibold mb-2 sm:mb-4">{post.theme}</p>
    {post.media && (
      <div className="mb-2 sm:mb-4">
        {post.media.type.startsWith('image/') ? (
          <img src={post.media.url} alt="Post media" className="max-w-full h-auto rounded-lg sm:rounded-xl object-cover" />
        ) : (
          <video controls src={post.media.url} className="max-w-full h-auto rounded-lg sm:rounded-xl" />
        )}
      </div>
    )}
    {post.pollOptions && (
      <div className="mb-2 sm:mb-4">
        <h4 className="text-xs sm:text-sm font-bold text-accent">Poll</h4>
        {post.pollOptions.map((option, index) => (
          <div key={index} className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
            <button
              onClick={() => handlePollVote(post._id, index)}
              className={`flex-1 p-1 sm:p-2 rounded-lg sm:rounded-xl border ${post.pollVotes?.[myId] === index ? 'bg-accent/20 border-accent' : 'border-gray-200 hover:bg-accent/10'} transition text-left text-xs sm:text-sm`}
              disabled={post.pollVotes?.[myId] !== undefined}
            >
              {option} ({post.pollResults?.[index] || 0} votes)
            </button>
          </div>
        ))}
        <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Total votes: {Object.values(post.pollResults || {}).reduce((a, b) => a + b, 0)}</p>
      </div>
    )}
    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
      <div className="relative group">
        <button className="flex items-center gap-1 sm:gap-1 text-accent hover:text-accent-dark transition">
          <Heart className="w-3 sm:w-4 h-3 sm:h-4" />
          {Object.values(post.reactions || {}).reduce((a, b) => a + b, 0)} Reactions
        </button>
        <div className="absolute hidden group-hover:flex gap-1 sm:gap-2 p-1 sm:p-2 bg-white shadow-lg sm:shadow-xl rounded-lg sm:rounded-xl z-10">
          <button onClick={() => handleLike(post._id, 'like')} className="text-accent hover:text-accent-dark flex items-center gap-1">
            <ThumbsUp className="w-3 sm:w-4 h-3 sm:h-4" /> Like
          </button>
          <button onClick={() => handleLike(post._id, 'celebrate')} className="text-accent hover:text-accent-dark flex items-center gap-1">
            <Award className="w-3 sm:w-4 h-3 sm:h-4" /> Celebrate
          </button>
          <button onClick={() => handleLike(post._id, 'insightful')} className="text-accent hover:text-accent-dark flex items-center gap-1">
            <Lightbulb className="w-3 sm:w-4 h-3 sm:h-4" /> Insightful
          </button>
        </div>
      </div>
      <button
        onClick={() => handleBookmark(post._id)}
        className={`flex items-center gap-1 sm:gap-1 ${post.bookmarks?.includes(myId) ? 'text-secondary' : 'text-accent'} hover:text-secondary-dark transition`}
      >
        <Bookmark className="w-3 sm:w-4 h-3 sm:h-4" />
        {post.bookmarks?.length || 0} Bookmarks
      </button>
      <button
        onClick={() => {
          const comment = prompt('Enter your comment:');
          if (comment) handleComment(post._id, comment);
        }}
        className="flex items-center gap-1 sm:gap-1 text-accent hover:text-accent-dark transition"
      >
        <MessageCircle className="w-3 sm:w-4 h-3 sm:h-4" />
        {post.comments?.length || 0} Comments
      </button>
    </div>
    {post.comments?.length > 0 && (
      <div className="mt-2 sm:mt-4">
        <h4 className="text-xs sm:text-sm font-bold text-accent">Comments</h4>
        {post.comments.map((comment, index) => (
          <p key={index} className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
            <span className="font-semibold">{comment.author?.name || 'Unknown'}:</span> {comment.content}
          </p>
        ))}
      </div>
    )}
  </motion.div>
);

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const token = localStorage.getItem('token');
  const myId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !myId) {
      toast.error('Please log in to view bookmarks');
      navigate('/login');
      return;
    }

    const fetchBookmarks = async () => {
      try {
        console.log(`[${new Date().toISOString()}] Fetching bookmarked posts`);
        const response = await API.get('/post/bookmarks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedBookmarks = Array.isArray(response.data.posts) ? response.data.posts : [];
        console.log(`[${new Date().toISOString()}] Fetched ${fetchedBookmarks.length} bookmarked posts:`, fetchedBookmarks.map(p => ({ id: p._id, content: p.content, author: p.author?.name })));
        setBookmarks(fetchedBookmarks);
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Error fetching bookmarks:`, err.response?.data || err.message, err.stack);
        toast.error('Failed to load bookmarks');
      }
    };

    const fetchFollowersAndFollowing = async () => {
      try {
        console.log(`[${new Date().toISOString()}] Fetching followers and following`);
        const response = await API.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedFollowers = Array.isArray(response.data.followers) ? response.data.followers : [];
        const fetchedFollowing = Array.isArray(response.data.following) ? response.data.following : [];
        setFollowers(fetchedFollowers);
        setFollowing(fetchedFollowing);
        console.log(
          `[${new Date().toISOString()}] Fetched ${fetchedFollowers.length} followers, ${fetchedFollowing.length} following:`,
          {
            followers: fetchedFollowers.map(f => ({ id: f._id, name: f.name })),
            following: fetchedFollowing.map(f => ({ id: f._id, name: f.name })),
          }
        );
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Error fetching followers and following:`, err.response?.data || err.message, err.stack);
        toast.error('Failed to load followers and following');
      }
    };

    fetchBookmarks();
    fetchFollowersAndFollowing();
  }, [token, myId, navigate]);

  const handleLike = async (postId, reactionType = 'like') => {
    if (!token || !myId) {
      toast.error('Please log in to react');
      return;
    }
    try {
      console.log(`[${new Date().toISOString()}] Adding reaction to post: ${postId}, type: ${reactionType}`);
      const response = await API.post(`/post/posts/${postId}/reaction`, { reactionType }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Reaction added:`, response.data);
      setBookmarks(prev => prev.map(post => post._id === postId ? response.data : post));
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error adding reaction:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to react to post');
    }
  };

  const handleBookmark = async (postId) => {
    if (!token || !myId) {
      toast.error('Please log in to bookmark posts');
      return;
    }
    try {
      console.log(`[${new Date().toISOString()}] Bookmarking post: ${postId}`);
      const response = await API.post(`/post/posts/${postId}/bookmark`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Bookmark toggled:`, response.data);
      setBookmarks(prev => prev.filter(post => post._id !== postId));
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error bookmarking post:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to bookmark post');
    }
  };

  const handleComment = async (postId, comment) => {
    if (!token || !myId) {
      toast.error('Please log in to comment');
      return;
    }
    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    try {
      console.log(`[${new Date().toISOString()}] Commenting on post: ${postId}, comment: ${comment}`);
      const response = await API.post(`/post/posts/${postId}/comment`, { content: comment }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Comment added:`, response.data);
      setBookmarks(prev => prev.map(post => post._id === postId ? response.data : post));
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error adding comment:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to add comment');
    }
  };

  const handlePollVote = async (postId, optionIndex) => {
    if (!token || !myId) {
      toast.error('Please log in to vote');
      return;
    }
    try {
      console.log(`[${new Date().toISOString()}] Voting on poll: ${postId}, option: ${optionIndex}`);
      const response = await API.post(`/post/posts/${postId}/poll-vote`, { optionIndex }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Poll vote recorded:`, response.data);
      setBookmarks(prev => prev.map(post => post._id === postId ? response.data : post));
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error voting on poll:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to vote on poll');
    }
  };

  const handleDelete = async (postId) => {
    if (!token || !myId) {
      toast.error('Please log in to delete posts');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      console.log(`[${new Date().toISOString()}] Deleting post: ${postId}`);
      await API.delete(`/post/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Post deleted: ${postId}`);
      toast.success('Post deleted successfully');
      setBookmarks(prev => prev.filter(post => post._id !== postId));
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error deleting post:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to delete post');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-primary to-indigo-600 font-sans text-gray-900">
        <div className="min-h-screen flex flex-col sm:flex-row">
          {/* Left Sidebar (Followers and Following) */}
          <motion.div
            variants={itemVariants}
            className="w-full sm:w-80 bg-white/90 rounded-r-none sm:rounded-r-3xl p-2 sm:p-6 shadow-md sm:shadow-2xl sticky top-2 sm:top-6 self-start ml-0 sm:ml-2 lg:left-0"
          >
            <h2 className="text-base sm:text-xl font-bold text-accent mb-2 sm:mb-4">My Followers</h2>
            {followers.length === 0 ? (
              <p className="text-gray-600 text-xs sm:text-sm">You have no followers yet.</p>
            ) : (
              <div className="space-y-1 sm:space-y-3 max-h-32 sm:max-h-64 overflow-y-auto scrollbar-hide">
                {followers.map((follower) => (
                  <Link
                    key={follower._id}
                    to={`/users/${follower._id}/profile`}
                    className="flex items-center gap-1 sm:gap-3 p-1 sm:p-3 bg-accent/10 rounded-lg sm:rounded-xl hover:bg-accent/20 transition"
                  >
                    <img
                      src={follower.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(follower.name)}`}
                      alt={follower.name}
                      className="w-5 sm:w-8 h-5 sm:h-8 rounded-full border-2 border-accent/50"
                      loading="lazy"
                    />
                    <p className="text-xs sm:text-sm text-accent font-medium">{follower.name}</p>
                  </Link>
                ))}
              </div>
            )}
            <h2 className="text-base sm:text-xl font-bold text-accent mt-2 sm:mt-6 mb-2 sm:mb-4">My Following</h2>
            {following.length === 0 ? (
              <p className="text-gray-600 text-xs sm:text-sm">You are not following anyone yet.</p>
            ) : (
              <div className="space-y-1 sm:space-y-3 max-h-32 sm:max-h-64 overflow-y-auto scrollbar-hide">
                {following.map((user) => (
                  <Link
                    key={user._id}
                    to={`/users/${user._id}/profile`}
                    className="flex items-center gap-1 sm:gap-3 p-1 sm:p-3 bg-accent/10 rounded-lg sm:rounded-xl hover:bg-accent/20 transition"
                  >
                    <img
                      src={user.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-5 sm:w-8 h-5 sm:h-8 rounded-full border-2 border-accent/50"
                      loading="lazy"
                    />
                    <p className="text-xs sm:text-sm text-accent font-medium">{user.name}</p>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
          {/* Main Content */}
          <div className="flex-1 p-2 sm:p-4 lg:p-6">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-2xl mx-auto">
              <motion.h1 variants={itemVariants} className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-600 mb-4 sm:mb-8">
                Bookmarked Posts
              </motion.h1>
              <motion.section variants={itemVariants} className="overflow-y-auto scrollbar-hide">
                <h2 className="text-base sm:text-lg font-semibold text-accent mb-2 sm:mb-4">Your Bookmarks</h2>
                {bookmarks.length === 0 ? (
                  <p className="text-gray-600 text-center text-sm sm:text-base">No bookmarked posts.</p>
                ) : (
                  bookmarks.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      myId={myId}
                      token={token}
                      handleLike={handleLike}
                      handleBookmark={handleBookmark}
                      handleComment={handleComment}
                      handlePollVote={handlePollVote}
                      handleDelete={handleDelete}
                    />
                  ))
                )}
              </motion.section>
            </motion.div>
          </div>
          {/* Right Sidebar (Go Back to Community) */}
          <motion.div
            variants={itemVariants}
            className="w-full sm:w-80 bg-white/90 rounded-l-none sm:rounded-l-3xl p-2 sm:p-6 shadow-md sm:shadow-2xl sticky top-2 sm:top-6 self-start mr-0 sm:mr-2 lg:right-0"
          >
            <h2 className="text-base sm:text-xl font-bold text-accent mb-2 sm:mb-4">Navigation</h2>
            <Link to="/community" className="text-accent hover:text-accent-dark flex items-center gap-1 sm:gap-2 text-xs sm:text-sm mb-2 sm:mb-4">
              <Bookmark className="w-4 sm:w-6 h-4 sm:h-6" /> Go Back to Community
            </Link>
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Bookmarks;