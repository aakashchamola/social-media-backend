const express = require("express");
const { validateRequest, createPostSchema } = require("../utils/validation");
const {
	create,
	getById,
	getUserPosts,
	getMyPosts,
	remove,
	getFeed,
	getMyScheduledPosts,
} = require("../controllers/posts");
const { authenticateToken, optionalAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * Posts routes
 */

// POST /api/posts - Create a new post
router.post("/", authenticateToken, validateRequest(createPostSchema), create);

// GET /api/posts/feed - Get posts from followed users + own posts
router.get("/feed", authenticateToken, getFeed);

// GET /api/posts/my - Get current user's posts
router.get("/my", authenticateToken, getMyPosts);

// GET /api/posts/scheduled - Get current user's scheduled posts
router.get("/scheduled", authenticateToken, getMyScheduledPosts);

// GET /api/posts/:post_id - Get a single post by ID
router.get("/:post_id", optionalAuth, getById);

// GET /api/posts/user/:user_id - Get posts by a specific user
router.get("/user/:user_id", optionalAuth, getUserPosts);

// DELETE /api/posts/:post_id - Delete a post
router.delete("/:post_id", authenticateToken, remove);

module.exports = router;
