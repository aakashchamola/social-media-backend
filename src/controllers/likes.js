const { 
  likePost, 
  unlikePost, 
  getPostLikes, 
  getUserLikes, 
  hasUserLikedPost 
} = require("../models/like");
const logger = require("../utils/logger");

/**
 * Like a post
 */
const likePostById = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    // Check if user has already liked this post
    const alreadyLiked = await hasUserLikedPost(userId, parseInt(post_id));
    if (alreadyLiked) {
      return res.status(400).json({ error: "Post already liked" });
    }

    const like = await likePost(userId, parseInt(post_id));

    if (!like) {
      return res.status(400).json({ error: "Post may not exist" });
    }

    logger.verbose(`User ${userId} liked post ${post_id}`);

    res.status(201).json({
      message: "Post liked successfully",
      liked: true
    });
  } catch (error) {
    logger.critical("Like post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Unlike a post
 */
const unlikePostById = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    const success = await unlikePost(userId, parseInt(post_id));

    if (!success) {
      return res.status(400).json({ error: "Post not liked or doesn't exist" });
    }

    logger.verbose(`User ${userId} unliked post ${post_id}`);

    res.json({
      message: "Post unliked successfully",
      liked: false
    });
  } catch (error) {
    logger.critical("Unlike post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get likes for a post
 */
const getLikesForPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const likes = await getPostLikes(parseInt(post_id), parseInt(limit), parseInt(offset));

    res.json({
      likes,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: likes.length === parseInt(limit)
      }
    });
  } catch (error) {
    logger.critical("Get post likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get posts liked by a user
 */
const getLikedPostsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const likedPosts = await getUserLikes(parseInt(user_id), parseInt(limit), parseInt(offset));

    res.json({
      liked_posts: likedPosts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: likedPosts.length === parseInt(limit)
      }
    });
  } catch (error) {
    logger.critical("Get user likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  likePostById,
  unlikePostById,
  getLikesForPost,
  getLikedPostsByUser,
};
