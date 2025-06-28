const express = require("express");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const {
  searchUsers,
  followUserById,
  unfollowUserById,
  getFollowingList,
  getFollowersList,
  getFollowStats,
  getUserProfileById,
} = require("../controllers/users");

const router = express.Router();

/**
 * User-related routes
 */

// GET /api/users/search - Find users by name
router.get("/search", searchUsers);

// POST /api/users/follow/:user_id - Follow a user
router.post("/follow/:user_id", authenticateToken, followUserById);

// DELETE /api/users/follow/:user_id - Unfollow a user
router.delete("/follow/:user_id", authenticateToken, unfollowUserById);

// GET /api/users/following - Get users that current user follows
router.get("/following", authenticateToken, getFollowingList);

// GET /api/users/followers - Get users that follow current user
router.get("/followers", authenticateToken, getFollowersList);

// GET /api/users/stats - Get follow stats for current user
router.get("/stats", authenticateToken, getFollowStats);

// GET /api/users/:user_id - Get user profile by ID
router.get("/:user_id", optionalAuth, getUserProfileById);

module.exports = router;
