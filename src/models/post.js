const { query } = require("../utils/database");

/**
 * Post model for database operations
 */

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
const createPost = async ({
  user_id,
  content,
  media_url,
  comments_enabled = true,
  scheduled_at,
}) => {
  const isScheduled = scheduled_at ? true : false;
  const currentTime = new Date();
  
  const result = await query(
    `INSERT INTO posts (user_id, content, media_url, comments_enabled, is_scheduled, scheduled_at, created_at, is_deleted)
     VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
     RETURNING id, user_id, content, media_url, comments_enabled, is_scheduled, scheduled_at, created_at`,
    [user_id, content, media_url, comments_enabled, isScheduled, scheduled_at, currentTime],
  );

  return result.rows[0];
};

/**
 * Get post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object|null>} Post object or null
 */
const getPostById = async (postId) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = FALSE) as comments_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1 AND p.is_deleted = FALSE AND u.is_deleted = FALSE`,
    [postId],
  );

  return result.rows[0] || null;
};

/**
 * Get posts by user ID
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const getPostsByUserId = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = FALSE) as comments_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1 AND p.is_deleted = FALSE AND u.is_deleted = FALSE
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );

  return result.rows;
};

/**
 * Delete a post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} Success status
 */
const deletePost = async (postId, userId) => {
  const result = await query(
    "UPDATE posts SET is_deleted = TRUE WHERE id = $1 AND user_id = $2",
    [postId, userId],
  );

  return result.rowCount > 0;
};

/**
 * Get feed posts for a user (posts from followed users + own posts)
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const getFeedPosts = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = FALSE) as comments_count,
            CASE WHEN l.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_liked_by_user
     FROM posts p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN likes l ON p.id = l.post_id AND l.user_id = $1
     WHERE p.is_deleted = FALSE AND u.is_deleted = FALSE AND p.is_scheduled = FALSE
           AND (p.user_id = $1 OR p.user_id IN (
               SELECT following_id FROM follows WHERE follower_id = $1
           ))
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );

  return result.rows;
};

/**
 * Get scheduled posts that should be published now
 * @returns {Promise<Array>} Array of posts to be published
 */
const getScheduledPostsToPublish = async () => {
  const result = await query(
    `UPDATE posts 
     SET is_scheduled = FALSE, created_at = NOW(), updated_at = NOW()
     WHERE is_scheduled = TRUE 
           AND scheduled_at <= NOW() 
           AND is_deleted = FALSE
     RETURNING id, user_id, content, media_url, created_at`,
  );

  return result.rows;
};

/**
 * Get user's scheduled posts
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of scheduled posts
 */
const getScheduledPosts = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1 AND p.is_scheduled = TRUE AND p.is_deleted = FALSE
     ORDER BY p.scheduled_at ASC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );

  return result.rows;
};

module.exports = {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  getFeedPosts,
  getScheduledPostsToPublish,
  getScheduledPosts,
};
