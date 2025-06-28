const express = require("express");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { validateRequest, createCommentSchema, updateCommentSchema } = require("../utils/validation");
const {
  createCommentOnPost,
  updateCommentById,
  deleteCommentById,
  getCommentsForPost,
} = require("../controllers/comments");

const router = express.Router();

/**
 * Comments routes
 */

// POST /api/comments/post/:post_id - Create a comment on a post
router.post("/post/:post_id", authenticateToken, validateRequest(createCommentSchema), createCommentOnPost);

// PATCH /api/comments/:comment_id - Update a comment
router.patch("/:comment_id", authenticateToken, validateRequest(updateCommentSchema), updateCommentById);

// DELETE /api/comments/:comment_id - Delete a comment
router.delete("/:comment_id", authenticateToken, deleteCommentById);

// GET /api/comments/post/:post_id - Get comments for a post
router.get("/post/:post_id", getCommentsForPost);

module.exports = router;
