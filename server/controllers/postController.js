const Post = require('../models/postModel');
const TrendingSkill = require('../models/trendingSkillModel');
const User = require('../models/User');
const mongoose = require('mongoose');
const GridFSBucket = require('mongodb').GridFSBucket;

const conn = mongoose.connection;
let gfs;
conn.once('open', () => {
  gfs = new GridFSBucket(conn.db, { bucketName: 'media' });
});

const extractSkills = (content) => {
  const baseSkills = ['javascript', 'python', 'react', 'node', 'ai', 'blockchain', 'web3', 'iot'];
  const contentSkills = content
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 2);
  return [...new Set([...baseSkills, ...contentSkills])];
};

exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, theme } = req.query;
    const skip = (page - 1) * limit;
    console.log(`[${new Date().toISOString()}] GET /api/post/posts - Fetching posts for user: ${req.user._id}, page: ${page}, skip: ${skip}, limit: ${limit}, theme: ${theme || 'all'}`);
    const query = theme ? { theme } : {};
    const posts = await Post.find(query)
      .populate([
        { path: 'author', select: 'name' },
        { path: 'comments.author', select: 'name' },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Post.countDocuments(query);
    console.log(`[${new Date().toISOString()}] Found ${posts.length} posts, total: ${total}`);
    res.json({ posts, total, hasMore: skip + posts.length < total });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error fetching posts:`, err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, pollOptions, theme } = req.body;
    let media = null;
    if (req.file) {
      media = {
        url: `/api/post/media/${req.file.id}`,
        type: req.file.mimetype,
      };
    }
    if (!content && !media && !pollOptions) {
      return res.status(400).json({ message: 'Post content, media, or poll is required' });
    }
    if (!['Announcements', 'Tips', 'Events', 'Challenges', 'Mentors Wanted', 'Learning Requests'].includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme' });
    }
    console.log(`[${new Date().toISOString()}] POST /api/post/posts - Creating post for user: ${req.user._id}, content: ${content}, theme: ${theme}`);

    const postData = {
      content,
      author: req.user._id,
      media,
      theme,
    };

    if (pollOptions) {
      const parsedPollOptions = JSON.parse(pollOptions);
      if (Array.isArray(parsedPollOptions) && parsedPollOptions.every(opt => typeof opt === 'string' && opt.trim())) {
        postData.pollOptions = parsedPollOptions;
        postData.pollResults = Array(parsedPollOptions.length).fill(0);
        postData.pollVotes = new Map();
      } else {
        return res.status(400).json({ message: 'Invalid poll options' });
      }
    }

    const post = new Post(postData);
    await post.save();

    if (content) {
      const skills = extractSkills(content);
      for (const skill of skills) {
        await TrendingSkill.findOneAndUpdate(
          { name: skill },
          { $inc: { count: 1 }, updatedAt: Date.now() },
          { upsert: true }
        );
      }
    }
    await post.populate([{ path: 'author', select: 'name' }]);
    res.status(201).json(post);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error creating post:`, err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }
    if (post.media) {
      const fileId = new mongoose.Types.ObjectId(post.media.url.split('/media/')[1]);
      await gfs.delete(fileId);
    }
    await Post.deleteOne({ _id: req.params.id });
    console.log(`[${new Date().toISOString()}] DELETE /api/post/posts/${req.params.id} - Post deleted by user: ${req.user._id}`);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error deleting post:`, err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addReaction = async (req, res) => {
  try {
    const { reactionType } = req.body;
    if (!['like', 'celebrate', 'insightful'].includes(reactionType)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const userId = req.user._id.toString();
    post.reactions = post.reactions || { like: 0, celebrate: 0, insightful: 0 };
    post.likes = post.likes || [];
    if (reactionType === 'like') {
      if (!post.likes.includes(userId)) {
        post.likes.push(userId);
        post.reactions.like = (post.reactions.like || 0) + 1;
      }
    } else {
      post.likes = post.likes.filter(id => id.toString() !== userId);
      post.reactions.like = (post.reactions.like || 0) - (post.likes.includes(userId) ? 1 : 0);
      post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
    }
    await post.save();
    console.log(`[${new Date().toISOString()}] POST /api/post/posts/${req.params.id}/reaction - User ${userId} reacted with ${reactionType}`);
    await post.populate([
      { path: 'author', select: 'name' },
      { path: 'comments.author', select: 'name' },
    ]);
    res.json(post);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error adding reaction:`, err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.bookmarkPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const userId = req.user._id;
    post.bookmarks = post.bookmarks || [];
    const index = post.bookmarks.indexOf(userId);
    if (index === -1) {
      post.bookmarks.push(userId);
      console.log(`[${new Date().toISOString()}] POST /api/post/posts/${req.params.id}/bookmark - User ${userId} bookmarked post`);
    } else {
      post.bookmarks.splice(index, 1);
      console.log(`[${new Date().toISOString()}] POST /api/post/posts/${req.params.id}/bookmark - User ${userId} unbookmarked post`);
    }
    await post.save();
    await post.populate([
      { path: 'author', select: 'name' },
      { path: 'comments.author', select: 'name' },
    ]);
    res.json(post);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error bookmarking post:`, err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookmarkedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(`[${new Date().toISOString()}] GET /api/post/bookmarks - Fetching bookmarked posts for user: ${userId}`);
    const posts = await Post.find({ bookmarks: userId })
      .populate([
        { path: 'author', select: 'name' },
        { path: 'comments.author', select: 'name' },
      ])
      .sort({ createdAt: -1 });
    console.log(`[${new Date().toISOString()}] Found ${posts.length} bookmarked posts`);
    res.json({ posts, hasMore: false });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error fetching bookmarked posts:`, err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    console.log(`[${new Date().toISOString()}] POST /api/post/posts/${req.params.id}/comment - User ${req.user._id} adding comment: ${content}`);
    post.comments.push({ author: req.user._id, content });
    await post.save();
    const skills = extractSkills(content);
    for (const skill of skills) {
      await TrendingSkill.findOneAndUpdate(
        { name: skill },
        { $inc: { count: 1 }, updatedAt: Date.now() },
        { upsert: true }
      );
    }
    await post.populate([
      { path: 'author', select: 'name' },
      { path: 'comments.author', select: 'name' },
    ]);
    res.json(post);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error adding comment:`, err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post || !post.pollOptions) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    if (optionIndex < 0 || optionIndex >= post.pollOptions.length) {
      return res.status(400).json({ message: 'Invalid poll option' });
    }
    const userId = req.user._id.toString();
    if (post.pollVotes.has(userId)) {
      return res.status(400).json({ message: 'User already voted' });
    }
    post.pollVotes.set(userId, optionIndex);
    post.pollResults[optionIndex] = (post.pollResults[optionIndex] || 0) + 1;
    await post.save();
    console.log(`[${new Date().toISOString()}] POST /api/post/posts/${req.params.id}/poll-vote - User ${userId} voted for option ${optionIndex}`);
    await post.populate([
      { path: 'author', select: 'name' },
      { path: 'comments.author', select: 'name' },
    ]);
    res.json(post);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error voting on poll:`, err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMedia = async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = gfs.openDownloadStream(fileId);
    downloadStream.on('error', () => res.status(404).json({ message: 'Media not found' }));
    downloadStream.pipe(res);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error fetching media:`, err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTrendingSkills = async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] GET /api/post/trending-skills - Fetching trending skills`);
    const skills = await TrendingSkill.find()
      .sort({ count: -1, updatedAt: -1 })
      .limit(10)
      .lean();
    console.log(
      `[${new Date().toISOString()}] Found ${skills.length} trending skills:`,
      skills.map(s => ({ name: s.name, count: s.count }))
    );
    res.json(skills);
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error fetching trending skills:`,
      err.message,
      err.stack
    );
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTrendingSkills = async () => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting trending skills update`);

  try {
    const [users, posts] = await Promise.all([
      User.find().select('skillsOffered skillsWanted').lean(),
      Post.find().select('content').lean(),
    ]);

    const skillCounts = {};

    users.forEach(user => {
      [...user.skillsOffered, ...user.skillsWanted].forEach(skillObj => {
        const skill = skillObj.skill.toLowerCase().trim();
        if (skill) {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        }
      });
    });

    posts.forEach(post => {
      if (post.content) {
        const skills = extractSkills(post.content);
        skills.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });

    const bulkOps = Object.entries(skillCounts).map(([skill, count]) => ({
      updateOne: {
        filter: { name: skill },
        update: { $set: { count, updatedAt: new Date() } },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await TrendingSkill.bulkWrite(bulkOps);
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await TrendingSkill.deleteMany({ updatedAt: { $lt: yesterday } });

    console.log(
      `[${new Date().toISOString()}] Updated trending skills:`,
      Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))
    );
    console.log(`[${new Date().toISOString()}] Trending skills update completed in ${Date.now() - startTime}ms`);
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error updating trending skills:`,
      err.message,
      err.stack
    );
  }
};