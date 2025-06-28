const { query } = require("../utils/database");

/**
 * Follow model for managing user relationships
 */

/**
 * Follow a user
 * @param {number} followerId - ID of the user who is following
 * @param {number} followingId - ID of the user being followed
 * @returns {Promise<Object>} Follow relationship
 */
const followUser = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new Error("Cannot follow yourself");
  }

  const result = await query(
    `INSERT INTO follows (follower_id, following_id, created_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (follower_id, following_id) DO NOTHING
     RETURNING *`,
    [followerId, followingId]
  );

  return result.rows[0];
};

/**
 * Unfollow a user
 * @param {number} followerId - ID of the user who is unfollowing
 * @param {number} followingId - ID of the user being unfollowed
 * @returns {Promise<boolean>} Success status
 */
const unfollowUser = async (followerId, followingId) => {
  const result = await query(
    `DELETE FROM follows 
     WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId]
  );

  return result.rowCount > 0;
};

/**
 * Get users that a user is following
 * @param {number} userId - User ID
 * @param {number} limit - Limit number of results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} List of users being followed
 */
const getFollowing = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name, u.created_at, f.created_at as followed_at
     FROM follows f
     JOIN users u ON f.following_id = u.id
     WHERE f.follower_id = $1 AND u.is_deleted = FALSE
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Get users that follow a user
 * @param {number} userId - User ID
 * @param {number} limit - Limit number of results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} List of followers
 */
const getFollowers = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name, u.created_at, f.created_at as followed_at
     FROM follows f
     JOIN users u ON f.follower_id = u.id
     WHERE f.following_id = $1 AND u.is_deleted = FALSE
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Get follow counts for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Follow counts
 */
const getFollowCounts = async (userId) => {
  const result = await query(
    `SELECT 
       (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as following_count,
       (SELECT COUNT(*) FROM follows WHERE following_id = $1) as followers_count`,
    [userId]
  );

  return result.rows[0];
};

/**
 * Check if user1 is following user2
 * @param {number} followerId - ID of potential follower
 * @param {number} followingId - ID of potential followed user
 * @returns {Promise<boolean>} Follow status
 */
const isFollowing = async (followerId, followingId) => {
  const result = await query(
    `SELECT 1 FROM follows 
     WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId]
  );

  return result.rows.length > 0;
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
  isFollowing,
};
