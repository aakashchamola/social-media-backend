const { query } = require("../utils/database");
const bcrypt = require("bcryptjs");

/**
 * User model for database operations
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async ({ username, email, password, full_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, username, email, full_name, created_at`,
    [username, email, password, full_name],
  );

  return result.rows[0];
};

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object or null
 */
const getUserByUsername = async (username) => {
  const result = await query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
const getUserById = async (id) => {
  const result = await query(
    "SELECT id, username, email, full_name, created_at FROM users WHERE id = $1",
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} Password match result
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Find users by name (partial matching)
 * @param {string} searchTerm - Search term for name
 * @param {number} limit - Limit number of results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} List of users
 */
const findUsersByName = async (searchTerm, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT id, username, full_name, created_at
     FROM users 
     WHERE (LOWER(username) LIKE LOWER($1) OR LOWER(full_name) LIKE LOWER($1))
           AND is_deleted = FALSE
     ORDER BY 
       CASE 
         WHEN LOWER(username) = LOWER($2) THEN 1
         WHEN LOWER(full_name) = LOWER($2) THEN 2
         WHEN LOWER(username) LIKE LOWER($1) THEN 3
         ELSE 4
       END,
       created_at DESC
     LIMIT $3 OFFSET $4`,
    [`%${searchTerm}%`, searchTerm, limit, offset]
  );

  return result.rows;
};

/**
 * Get user profile with follower/following counts
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User profile with stats
 */
const getUserProfile = async (userId) => {
  const result = await query(
    `SELECT u.id, u.username, u.email, u.full_name, u.created_at,
            (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
            (SELECT COUNT(*) FROM posts WHERE user_id = u.id AND is_deleted = FALSE) as posts_count
     FROM users u
     WHERE u.id = $1 AND u.is_deleted = FALSE`,
    [userId]
  );

  return result.rows[0];
};

/**
 * Update user profile
 * @param {number} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user
 */
const updateUserProfile = async (userId, updateData) => {
  const { full_name, email } = updateData;
  
  const result = await query(
    `UPDATE users 
     SET full_name = COALESCE($1, full_name),
         email = COALESCE($2, email),
         updated_at = NOW()
     WHERE id = $3 AND is_deleted = FALSE
     RETURNING id, username, email, full_name, created_at, updated_at`,
    [full_name, email, userId]
  );

  return result.rows[0];
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  findUsersByName,
  getUserProfile,
  updateUserProfile,
};
