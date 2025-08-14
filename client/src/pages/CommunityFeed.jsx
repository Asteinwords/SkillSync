import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import EmojiPicker from 'emoji-picker-react';
import { Send, Heart, Bookmark, MessageCircle, ThumbsUp, Award, Lightbulb, Image, Video, BarChart, Trash2 } from 'lucide-react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[${new Date().toISOString()}] ErrorBoundary caught in CommunityFeed:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-400 text-center p-4 sm:p-6 font-sans text-base sm:text-lg">
          Something went wrong in the Community Hub. Please refresh.
        </div>
      );
    }
    return this.props.children;
  }
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1, duration: 0.5 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const PostCard = ({ post, myId, token, handleLike, handleBookmark, handleComment, handlePollVote, handleDelete }) => {
  const totalVotes = post.pollResults ? Object.values(post.pollResults).reduce((a, b) => a + b, 0) : 0;
  console.log(`[${new Date().toISOString()}] PostCard - Rendering poll for post ${post._id}, totalVotes: ${totalVotes}, pollResults:`, post.pollResults, 'pollOptions:', post.pollOptions);

  return (
    <motion.div
      variants={cardVariants}
      className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-md sm:shadow-xl border-t-4 border-secondary transition-all duration-300 hover:shadow-lg sm:hover:shadow-2xl"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/30 flex items-center justify-center text-accent font-extrabold text-lg sm:text-xl">
            {post.author?.name?.[0] || '?'}
          </div>
          <div>
            <Link
              to={`/users/${post.author?._id}/profile`}
              className="font-bold text-gray-900 text-base sm:text-lg hover:text-accent transition"
            >
              {post.author?.name || 'Unknown User'}
            </Link>
            <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
          </div>
        </div>
        {post

.author?._id === myId && (
          <button
            onClick={() => handleDelete(post._id)}
            className="text-red-400 hover:text-red-600 transition"
            title="Delete Post"
          >
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </div>
      <p className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">{post.content}</p>
      <p className="text-xs sm:text-sm text-secondary font-semibold mb-3 sm:mb-4">{post.theme}</p>
      {post.media && (
        <div className="mb-4 sm:mb-6">
          { caldo .media.type.startsWith('image/') ? (
            <img src={post.media.url} alt="Post media" className="max-w-full h-auto rounded-xl sm:rounded-2xl object-cover" />
          ) : (
            <video controls src={post.media.url} className="max-w-full h-auto rounded-xl sm:rounded-2xl" />
          )}
        </div>
      )}
      {post.pollOptions && post.pollOptions.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <h4 className="text-xs sm:text-sm font-bold text-accent">Poll</h4>
          {post.pollOptions.map((option, index) => {
            const votes = post.pollResults?.[index] || 0;
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            console.log(`[${new Date().toISOString()}] PostCard - Option ${index}: ${option}, votes: ${votes}, percentage: ${percentage}%`);
            return (
              <button
                key={index}
                onClick={() => handlePollVote(post._id, index)}
                className="flex w-full p-2 sm:p-3 mt-2 rounded-lg border text-left text-xs sm:text-sm relative overflow-hidden group"
                disabled={post.pollVotes?.[myId] !== undefined}
              >
                <span className="z-10 relative flex-1">{option}</span>
                <span className="z-10 relative ml-2 sm:ml-4">({votes} votes)</span>
                <span
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-accent to-accent-dark opacity-90 transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
                <span
                  className="absolute left-0 top-0 h-full bg-gray-200 opacity-30 group-hover:opacity-50 transition-opacity duration-300"
                  style={{ width: '100%' }}
                />
              </button>
            );
          })}
          <p className="text-xs text-gray-500 mt-2">Total votes: {totalVotes}</p>
        </div>
      )}
      <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
        <div className="relative group">
          <button className="flex items-center gap-1 sm:gap-2 text-accent hover:text-accent-dark transition">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            {Object.values(post.reactions || {}).reduce((a, b) => a + b, 0)} Reactions
          </button>
          <div className="absolute hidden group-hover:flex gap-2 sm:gap-4 p-2 sm:p-4 bg-white shadow-lg sm:shadow-2xl rounded-lg sm:rounded-xl z-10">
            <button onClick={() => handleLike(post._id, 'like')} className="text-accent hover:text-accent-dark flex items-center gap-1 text-xs sm:text-sm">
              <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" /> Like
            </button>
            <button onClick={() => handleLike(post._id, 'celebrate')} className="text-accent hover:text-accent-dark flex items-center gap-1 text-xs sm:text-sm">
              <Award className="w-3 h-3 sm:w-4 sm:h-4" /> Celebrate
            </button>
            <button onClick={() => handleLike(post._id, 'insightful')} className="text-accent hover:text-accent-dark flex items-center gap-1 text-xs sm:text-sm">
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" /> Insightful
            </button>
          </div>
        </div>
        <button
          onClick={() => handleBookmark(post._id)}
          className={`flex items-center gap-1 sm:gap-2 ${post.bookmarks?.includes(myId) ? 'text-secondary' : 'text-accent'} hover:text-secondary-dark transition`}
        >
          <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
          {post.bookmarks?.length || 0}
        </button>
        <button
          onClick={() => {
            const comment = prompt('Enter your comment:');
            if (comment) handleComment(post._id, comment);
          }}
          className="flex items-center gap-1 sm:gap-2 text-accent hover:text-accent-dark transition"
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          {post.comments?.length || 0}
        </button>
      </div>
      {post.comments?.length > 0 && (
        <div className="mt-3 sm:mt-4">
          <h4 className="text-xs sm:text-sm font-bold text-accent">Comments</h4>
          {post.comments.map((comment, index) => (
            <p key={index} className="text-xs sm:text-sm text-gray-600 mt-2">
              <span className="font-semibold">{comment.author?.name || 'Unknown'}:</span> {comment.content}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [media, setMedia] = useState(null);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isPoll, setIsPoll] = useState(false);
  const [theme, setTheme] = useState('Tips');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const token = localStorage.getItem('token');
  const myId = localStorage.getItem('userId');
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  const fetchPosts = async (pageNum = 1, selectedFilter = filter) => {
    if (!token || !myId) return;
    try {
      console.log(`[${new Date().toISOString()}] Fetching posts for page: ${pageNum}, filter: ${selectedFilter}`);
      const response = await API.get(`/post/posts?page=${pageNum}&limit=10${selectedFilter !== 'All' ? `&theme=${selectedFilter}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedPosts = Array.isArray(response.data.posts) ? response.data.posts : [];
      console.log(`[${new Date().toISOString()}] Fetched ${fetchedPosts.length} posts:`, fetchedPosts.map(p => ({ id: p._id, content: p.content, author: p.author?.name })));
      setPosts(prev => pageNum === 1 ? fetchedPosts : [...prev, ...fetchedPosts]);
      setHasMore(response.data.hasMore);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error fetching posts:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to load posts');
    }
  };

  const fetchEvents = async () => {
    if (!token) return;
    try {
      console.log(`[${new Date().toISOString()}] Fetching events`);
      const response = await API.get('/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error fetching events:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to load events');
    }
  };

  const fetchTrendingSkills = useCallback(async () => {
    if (!token || !myId) return;
    setIsLoadingSkills(true);
    try {
      console.log(`[${new Date().toISOString()}] Fetching trending skills`);
      const response = await API.get('/post/trending-skills', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const skills = Array.isArray(response.data) ? response.data : [];
      setTrendingSkills(skills);
      console.log(
        `[${new Date().toISOString()}] Found ${skills.length} trending skills:`,
        skills.map(s => ({ name: s.name, count: s.count }))
      );
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Error fetching trending skills:`,
        err.response?.data || err.message,
        err.stack
      );
      toast.error('Failed to load trending skills. Retrying...');
      setTimeout(fetchTrendingSkills, 5000);
    } finally {
      setIsLoadingSkills(false);
    }
  }, [token, myId]);

  const fetchFollowersAndFollowing = async () => {
    if (!token || !myId) return;
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

  useEffect(() => {
    if (!token || !myId) {
      toast.error('Please log in to access the Community Hub');
      navigate('/login');
      return;
    }
    fetchPosts(1, filter);
    fetchEvents();
    fetchTrendingSkills();
    fetchFollowersAndFollowing();
    const interval = setInterval(() => {
      console.log(`[${new Date().toISOString()}] Refreshing posts, events, skills, followers, and following`);
      fetchPosts(1, filter);
      fetchEvents();
      fetchTrendingSkills();
      fetchFollowersAndFollowing();
    }, 300000);
    return () => clearInterval(interval);
  }, [token, myId, filter, fetchTrendingSkills, navigate]);

  useEffect(() => {
    if (!token || !myId) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, token, myId]);

  useEffect(() => {
    if (page > 1) fetchPosts(page, filter);
  }, [page, filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !myId) {
      toast.error('Please log in to post');
      return;
    }
    if (!newPost.trim() && !media && !isPoll) {
      toast.error('Add content, media, or a poll');
      return;
    }
    if (isPoll && pollOptions.some(opt => !opt.trim())) {
      toast.error('Fill all poll options');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('content', newPost);
      formData.append('theme', theme);
      if (media) formData.append('media', media);
      if (isPoll) formData.append('pollOptions', JSON.stringify(pollOptions));
      console.log(`[${new Date().toISOString()}] Submitting post:`, { content: newPost, theme, isPoll, pollOptions });
      const response = await API.post('/post/posts', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      console.log(`[${new Date().toISOString()}] Post created:`, response.data);
      toast.success('Post created');
      setNewPost('');
      setMedia(null);
      setIsPoll(false);
      setPollOptions(['', '']);
      setTheme('Tips');
      setShowEmojiPicker(false);
      fetchPosts(1, filter);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error creating post:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to create post');
    }
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setMedia(file);
      console.log(`[${new Date().toISOString()}] Selected media:`, file.name);
    } else {
      toast.error('Only images or videos allowed');
    }
  };

  const handleLike = async (postId, reactionType = 'like') => {
    if (!token || !myId) {
      toast.error('Log in to react to posts');
      return;
    }
    try {
      console.log(`[${new Date().toISOString()}] Adding reaction to post: ${postId}, type: ${reactionType}`);
      const response = await API.post(`/post/posts/${postId}/reaction`, { reactionType }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Reaction added:`, response.data);
      setPosts(prev => prev.map(post => post._id === postId ? response.data : post));
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error adding reaction:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to react to post');
    }
  };

  const handleBookmark = async (postId) => {
    if (!token || !myId) {
      toast.error('Log in to bookmark posts');
      return;
    }
    try {
      console.log(`[${new Date().toISOString()}] Bookmarking post: ${postId}`);
      const response = await API.post(`/post/posts/${postId}/bookmark`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Bookmark toggled:`, response.data);
      setPosts(prev => prev.map(post => post._id === postId ? response.data : post));
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error bookmarking post:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to bookmark post');
    }
  };

  const handleComment = async (postId, comment) => {
    if (!token || !myId) {
      toast.error('Log in to comment');
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
      setPosts(prev => prev.map(post => post._id === postId ? response.data : post));
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error adding comment:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to add comment');
    }
  };

  const handlePollVote = async (postId, optionIndex) => {
    if (!token || !myId) {
      toast.error('Log in to vote');
      return;
    }
    try {
      console.log(`[${new Date().toISOString()}] Voting on poll: ${postId}, option: ${optionIndex}`);
      const response = await API.post(`/post/posts/${postId}/poll-vote`, { optionIndex }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Poll vote recorded:`, response.data);
      setPosts(prev => prev.map(post => post._id === postId ? response.data : post));
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error voting on poll:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to vote on poll');
    }
  };

  const handleDelete = async (postId) => {
    if (!token || !myId) {
      toast.error('Log in to delete posts');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      console.log(`[${new Date().toISOString()}] Deleting post: ${postId}`);
      await API.delete(`/post/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Post deleted: ${postId}`);
      toast.success('Post deleted');
      setPosts(prev => prev.filter(post => post._id !== postId));
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error deleting post:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to delete post');
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    } else {
      toast.error('Maximum 4 poll options allowed');
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    setPosts([]);
    fetchPosts(1, newFilter);
  };

  const handleEmojiClick = (emojiData) => {
    setNewPost(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-primary to-indigo-600 font-sans text-gray-900">
        <div className="flex flex-col lg:flex-row gap-4 p-4 lg:p-6">
          {/* Left Sidebar (Followers and Following) */}
          <motion.div
            variants={itemVariants}
            className="w-full lg:w-80 bg-white/90 rounded-3xl p-4 sm:p-6 shadow-md sm:shadow-2xl lg:sticky lg:top-6 lg:self-start"
          >
            <h2 className="text-lg sm:text-xl font-bold text-accent mb-4">My Followers</h2>
            {followers.length === 0 ? (
              <p className="text-gray-600 text-sm">You have no followers yet.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                {followers.map((follower) => (
                  <Link
                    key={follower._id}
                    to={`/users/${follower._id}/profile`}
                    className="flex items-center gap-3 p-3 bg-accent/10 rounded-xl hover:bg-accent/20 transition"
                  >
                    <img
                      src={follower.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(follower.name)}`}
                      alt={follower.name}
                      className="w-8 h-8 rounded-full border-2 border-accent/50"
                      loading="lazy"
                    />
                    <p className="text-sm text-accent font-medium">{follower.name}</p>
                  </Link>
                ))}
              </div>
            )}
            <h2 className="text-lg sm:text-xl font-bold text-accent mt-6 mb-4">My Following</h2>
            {following.length === 0 ? (
              <p className="text-gray-600 text-sm">You are not following anyone yet.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                {following.map((user) => (
                  <Link
                    key={user._id}
                    to={`/users/${user._id}/profile`}
                    className="flex items-center gap-3 p-3 bg-accent/10 rounded-xl hover:bg-accent/20 transition"
                  >
                    <img
                      src={user.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-accent/50"
                      loading="lazy"
                    />
                    <p className="text-sm text-accent font-medium">{user.name}</p>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
          {/* Main Content */}
          <div className="flex-1">
            <motion.h1
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-600 mb-6 sm:mb-8"
            >
              Community Hub
            </motion.h1>
            <motion.div variants={itemVariants} className="bg-white/90 rounded-3xl p-4 sm:p-6 shadow-md sm:shadow-2xl mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-accent mb-4">Filter Posts</h2>
              <div className="flex flex-wrap gap-2">
                {['All', 'Announcements', 'Tips', 'Events', 'Challenges', 'Mentors Wanted', 'Learning Requests'].map(f => (
                  <button
                    key={f}
                    onClick={() => handleFilterChange(f)}
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm ${filter === f ? 'bg-accent/20 text-accent font-bold' : 'text-accent hover:bg-accent/10'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-white/90 rounded-3xl p-4 sm:p-6 shadow-md sm:shadow-2xl mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-accent mb-4">Create a Post</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="border border-accent/30 bg-white/95 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-accent focus:outline-none transition text-xs sm:text-sm"
                  >
                    {['Announcements', 'Tips', 'Events', 'Challenges', 'Mentors Wanted', 'Learning Requests'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsPoll(!isPoll)}
                    className={`p-2 sm:p-3 rounded-full ${isPoll ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-600'} hover:bg-secondary-dark hover:text-white transition`}
                  >
                    <BarChart className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share your thoughts"
                    className="border border-accent/30 bg-white/95 px-3 py-2 sm:px-4 sm:py-3 rounded-lg w-full resize-none h-24 sm:h-32 focus:ring-2 focus:ring-accent focus:outline-none transition text-xs sm:text-sm"
                    required={!media && !isPoll}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 text-accent hover:text-accent-dark text-xl sm:text-2xl"
                  >
                    🙂
                  </button>
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 bottom-28 sm:bottom-36 left-2 sm:left-4"
                      >
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {isPoll && (
                  <div className="space-y-3">
                    {pollOptions.map((option, index) => (
                      <input
                        key={index}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...pollOptions];
                          newOptions[index] = e.target.value;
                          setPollOptions(newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                        className="border border-accent/30 bg-white/95 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-accent focus:outline-none transition text-xs sm:text-sm"
                        required
                      />
                    ))}
                    {pollOptions.length < 4 && (
                      <button type="button" onClick={addPollOption} className="text-accent hover:text-accent-dark text-xs sm:text-sm">
                        Add Option
                      </button>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-accent cursor-pointer text-xs sm:text-sm">
                    <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
                    {media ? <span>{media.name}</span> : <><Image className="w-5 h-5 sm:w-6 sm:h-6" /> Add Media</>}
                  </label>
                  <motion.button
                    type="submit"
                    className="bg-green-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2 shadow-md text-xs sm:text-sm"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                    Post
                  </motion.button>
                </div>
              </form>
            </motion.div>
            <motion.section variants={containerVariants} initial="hidden" animate="visible">
              <h2 className="text-lg sm:text-xl font-bold text-orange-500 mb-4">Recent Posts</h2>
              {posts.length === 0 ? (
                <p className="text-white/80 text-center text-sm">No posts yet. Be the first to share.</p>
              ) : (
                posts.map((post) => (
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
              {hasMore && (
                <div ref={loaderRef} className="text-center py-4 sm:py-6">
                  <p className="text-white/80 text-sm">Loading more posts...</p>
                </div>
              )}
            </motion.section>
          </div>
          {/* Right Sidebar (Platform Updates, Navigation, Events, Skills) */}
          <motion.div
            variants={itemVariants}
            className="w-full lg:w-80 bg-white/90 rounded-3xl p-4 sm:p-6 shadow-md sm:shadow-2xl lg:sticky lg:top-6 lg:self-start"
          >
            <h2 className="text-lg sm:text-xl font-bold text-accent mb-4">Platform Updates</h2>
            <p className="text-gray-600 text-sm mb-6">New: Media uploads and polls. Join our hackathon on Aug 10, 2025.</p>
            <h2 className="text-lg sm:text-xl font-bold text-accent mb-4">Navigation</h2>
            <Link to="/bookmarks" className="text-accent hover:text-accent-dark flex items-center gap-2 text-sm mb-4">
              <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" /> Bookmarks
            </Link>
            <h2 className="text-lg sm:text-xl font-bold text-accent mt-6 mb-4">Upcoming Events</h2>
            {events.length === 0 ? (
              <p className="text-gray-600 text-sm">No upcoming events.</p>
            ) : (
              events.map(event => (
                <div key={event._id} className="mb-4 p-3 sm:p-4 bg-accent/10 rounded-xl">
                  <h3 className="font-bold text-accent text-sm sm:text-base">{event.title}</h3>
                  <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
              ))
            )}
            <h2 className="text-lg sm:text-xl font-bold text-accent mt-6 mb-4">Trending Skills</h2>
            {isLoadingSkills ? (
              <p className="text-gray-600 text-sm">Loading trending skills...</p>
            ) : trendingSkills.length === 0 ? (
              <p className="text-gray-600 text-sm">No trending skills yet. Share to influence trends.</p>
            ) : (
              trendingSkills.map(skill => (
                <div key={skill._id} className="mb-3 p-3 bg-accent/10 rounded-xl">
                  <p className="font-bold text-accent capitalize text-sm sm:text-base">{skill.name}</p>
                  <p className="text-xs text-gray-500">{skill.count} mentions</p>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CommunityFeed;