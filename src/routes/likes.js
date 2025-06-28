const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  likePostById,
  unlikePostById,
  getLikesForPost,
  getLikedPostsByUser,
} = require("../controllers/likes");

const router = express.Router();

/**
 * Likes routes
 */

// POST /api/likes/post/:post_id - Like a post
router.post("/post/:post_id", authenticateToken, likePostById);

// DELETE /api/likes/post/:post_id - Unlike a post
router.delete("/post/:post_id", authenticateToken, unlikePostById);

// GET /api/likes/post/:post_id - Get likes for a post
router.get("/post/:post_id", getLikesForPost);

// GET /api/likes/user/:user_id - Get posts liked by a user
router.get("/user/:user_id", getLikedPostsByUser);

module.exports = router;
