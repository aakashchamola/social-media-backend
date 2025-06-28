const { findUsersByName, getUserProfile } = require("../models/user");
const { 
  followUser, 
  unfollowUser, 
  getFollowing, 
  getFollowers, 
  getFollowCounts,
  isFollowing 
} = require("../models/follow");
const logger = require("../utils/logger");

/**
 * Search users by name
 */
const searchUsers = async (req, res) => {
  try {
    const { name, limit = 20, offset = 0 } = req.query;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        error: "Search term must be at least 2 characters long" 
      });
    }

    const users = await findUsersByName(name.trim(), parseInt(limit), parseInt(offset));

    res.json({
      users,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: users.length === parseInt(limit)
      }
    });
  } catch (error) {
    logger.critical("Search users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Follow a user
 */
const followUserById = async (req, res) => {
  try {
    const { user_id } = req.params;
    const followerId = req.user.id;

    if (parseInt(user_id) === followerId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    // Check if target user exists
    const targetUser = await getUserProfile(parseInt(user_id));
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already following
    const alreadyFollowing = await isFollowing(followerId, parseInt(user_id));
    if (alreadyFollowing) {
      return res.status(400).json({ error: "Already following this user" });
    }

    await followUser(followerId, parseInt(user_id));

    logger.verbose(`User ${followerId} followed user ${user_id}`);

    res.status(201).json({
      message: "Successfully followed user",
      following: true
    });
  } catch (error) {
    logger.critical("Follow user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Unfollow a user
 */
const unfollowUserById = async (req, res) => {
  try {
    const { user_id } = req.params;
    const followerId = req.user.id;

    const success = await unfollowUser(followerId, parseInt(user_id));

    if (!success) {
      return res.status(400).json({ error: "Not following this user" });
    }

    logger.verbose(`User ${followerId} unfollowed user ${user_id}`);

    res.json({
      message: "Successfully unfollowed user",
      following: false
    });
  } catch (error) {
    logger.critical("Unfollow user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users that current user follows
 */
const getFollowingList = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;

    const following = await getFollowing(userId, parseInt(limit), parseInt(offset));

    res.json({
      following,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: following.length === parseInt(limit)
      }
    });
  } catch (error) {
    logger.critical("Get following error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users that follow current user
 */
const getFollowersList = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;

    const followers = await getFollowers(userId, parseInt(limit), parseInt(offset));

    res.json({
      followers,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: followers.length === parseInt(limit)
      }
    });
  } catch (error) {
    logger.critical("Get followers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get follow stats for current user
 */
const getFollowStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getFollowCounts(userId);

    res.json({
      stats: {
        followers_count: parseInt(stats.followers_count),
        following_count: parseInt(stats.following_count)
      }
    });
  } catch (error) {
    logger.critical("Get follow stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get user profile by ID
 */
const getUserProfileById = async (req, res) => {
  try {
    const { user_id } = req.params;
    const currentUserId = req.user?.id;

    const profile = await getUserProfile(parseInt(user_id));
    
    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if current user is following this user
    let isFollowingUser = false;
    if (currentUserId && currentUserId !== parseInt(user_id)) {
      isFollowingUser = await isFollowing(currentUserId, parseInt(user_id));
    }

    res.json({
      user: {
        ...profile,
        is_following: isFollowingUser,
        is_own_profile: currentUserId === parseInt(user_id)
      }
    });
  } catch (error) {
    logger.critical("Get user profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  searchUsers,
  followUserById,
  unfollowUserById,
  getFollowingList,
  getFollowersList,
  getFollowStats,
  getUserProfileById,
};
