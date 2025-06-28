const { query } = require("../utils/database");

/**
 * Like model for managing post likes
 */

/**
 * Like a post
 * @param {number} userId - User ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} Like object
 */
const likePost = async (userId, postId) => {
  const result = await query(
    `INSERT INTO likes (user_id, post_id, created_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id, post_id) DO NOTHING
     RETURNING *`,
    [userId, postId]
  );

  return result.rows[0];
};

/**
 * Unlike a post
 * @param {number} userId - User ID
 * @param {number} postId - Post ID
 * @returns {Promise<boolean>} Success status
 */
const unlikePost = async (userId, postId) => {
  const result = await query(
    `DELETE FROM likes 
     WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  );

  return result.rowCount > 0;
};

/**
 * Get likes for a post
 * @param {number} postId - Post ID
 * @param {number} limit - Limit number of results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} List of users who liked the post
 */
const getPostLikes = async (postId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name, l.created_at as liked_at
     FROM likes l
     JOIN users u ON l.user_id = u.id
     WHERE l.post_id = $1 AND u.is_deleted = FALSE
     ORDER BY l.created_at DESC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );

  return result.rows;
};

/**
 * Get posts liked by a user
 * @param {number} userId - User ID
 * @param {number} limit - Limit number of results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} List of liked posts
 */
const getUserLikes = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.id, p.content, p.media_url, p.created_at, l.created_at as liked_at,
            u.username, u.full_name
     FROM likes l
     JOIN posts p ON l.post_id = p.id
     JOIN users u ON p.user_id = u.id
     WHERE l.user_id = $1 AND p.is_deleted = FALSE AND u.is_deleted = FALSE
     ORDER BY l.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Check if user has liked a post
 * @param {number} userId - User ID
 * @param {number} postId - Post ID
 * @returns {Promise<boolean>} Like status
 */
const hasUserLikedPost = async (userId, postId) => {
  const result = await query(
    `SELECT 1 FROM likes 
     WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  );

  return result.rows.length > 0;
};

/**
 * Get like count for a post
 * @param {number} postId - Post ID
 * @returns {Promise<number>} Like count
 */
const getPostLikeCount = async (postId) => {
  const result = await query(
    `SELECT COUNT(*) as like_count 
     FROM likes WHERE post_id = $1`,
    [postId]
  );

  return parseInt(result.rows[0].like_count);
};

module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
  hasUserLikedPost,
  getPostLikeCount,
};
