const { query } = require("../utils/database");

/**
 * Comment model for managing post comments
 */

/**
 * Create a comment on a post
 * @param {number} userId - User ID
 * @param {number} postId - Post ID
 * @param {string} content - Comment content
 * @returns {Promise<Object>} Created comment
 */
const createComment = async (userId, postId, content) => {
  const result = await query(
    `INSERT INTO comments (user_id, post_id, content, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [userId, postId, content]
  );

  return result.rows[0];
};

/**
 * Update a comment
 * @param {number} commentId - Comment ID
 * @param {number} userId - User ID (for ownership verification)
 * @param {string} content - Updated content
 * @returns {Promise<Object>} Updated comment
 */
const updateComment = async (commentId, userId, content) => {
  const result = await query(
    `UPDATE comments 
     SET content = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 AND is_deleted = FALSE
     RETURNING *`,
    [content, commentId, userId]
  );

  return result.rows[0];
};

/**
 * Delete a comment (soft delete)
 * @param {number} commentId - Comment ID
 * @param {number} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} Success status
 */
const deleteComment = async (commentId, userId) => {
  const result = await query(
    `UPDATE comments 
     SET is_deleted = TRUE, updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE`,
    [commentId, userId]
  );

  return result.rowCount > 0;
};

/**
 * Get comments for a post
 * @param {number} postId - Post ID
 * @param {number} limit - Limit number of results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} List of comments
 */
const getPostComments = async (postId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT c.id, c.content, c.created_at, c.updated_at,
            u.id as user_id, u.username, u.full_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = $1 AND c.is_deleted = FALSE AND u.is_deleted = FALSE
     ORDER BY c.created_at ASC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );

  return result.rows;
};

/**
 * Get a comment by ID
 * @param {number} commentId - Comment ID
 * @returns {Promise<Object>} Comment object
 */
const getCommentById = async (commentId) => {
  const result = await query(
    `SELECT c.*, u.username, u.full_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.id = $1 AND c.is_deleted = FALSE AND u.is_deleted = FALSE`,
    [commentId]
  );

  return result.rows[0];
};

/**
 * Get comment count for a post
 * @param {number} postId - Post ID
 * @returns {Promise<number>} Comment count
 */
const getPostCommentCount = async (postId) => {
  const result = await query(
    `SELECT COUNT(*) as comment_count 
     FROM comments WHERE post_id = $1 AND is_deleted = FALSE`,
    [postId]
  );

  return parseInt(result.rows[0].comment_count);
};

/**
 * Check if comments are enabled for a post
 * @param {number} postId - Post ID
 * @returns {Promise<boolean>} Comments enabled status
 */
const areCommentsEnabled = async (postId) => {
  const result = await query(
    `SELECT comments_enabled FROM posts WHERE id = $1`,
    [postId]
  );

  return result.rows[0]?.comments_enabled || false;
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  getCommentById,
  getPostCommentCount,
  areCommentsEnabled,
};
