const { 
  createComment, 
  updateComment, 
  deleteComment, 
  getPostComments, 
  getCommentById,
  areCommentsEnabled 
} = require("../models/comment");
const { validateRequest, createCommentSchema, updateCommentSchema } = require("../utils/validation");
const logger = require("../utils/logger");

/**
 * Create a comment on a post
 */
const createCommentOnPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { content } = req.validatedData;
    const userId = req.user.id;

    // Check if comments are enabled for this post
    const commentsEnabled = await areCommentsEnabled(parseInt(post_id));
    if (!commentsEnabled) {
      return res.status(400).json({ error: "Comments are disabled for this post" });
    }

    const comment = await createComment(userId, parseInt(post_id), content);

    logger.verbose(`Comment created by user ${userId} on post ${post_id}`);

    res.status(201).json({
      message: "Comment created successfully",
      comment: {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: userId,
        post_id: parseInt(post_id)
      }
    });
  } catch (error) {
    logger.critical("Create comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a comment
 */
const updateCommentById = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { content } = req.validatedData;
    const userId = req.user.id;

    const updatedComment = await updateComment(parseInt(comment_id), userId, content);

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found or you don't have permission to edit it" });
    }

    logger.verbose(`Comment ${comment_id} updated by user ${userId}`);

    res.json({
      message: "Comment updated successfully",
      comment: {
        id: updatedComment.id,
        content: updatedComment.content,
        updated_at: updatedComment.updated_at,
        created_at: updatedComment.created_at
      }
    });
  } catch (error) {
    logger.critical("Update comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a comment
 */
const deleteCommentById = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const userId = req.user.id;

    const success = await deleteComment(parseInt(comment_id), userId);

    if (!success) {
      return res.status(404).json({ error: "Comment not found or you don't have permission to delete it" });
    }

    logger.verbose(`Comment ${comment_id} deleted by user ${userId}`);

    res.json({
      message: "Comment deleted successfully"
    });
  } catch (error) {
    logger.critical("Delete comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get comments for a post
 */
const getCommentsForPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const comments = await getPostComments(parseInt(post_id), parseInt(limit), parseInt(offset));

    res.json({
      comments,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: comments.length === parseInt(limit)
      }
    });
  } catch (error) {
    logger.critical("Get post comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createCommentOnPost,
  updateCommentById,
  deleteCommentById,
  getCommentsForPost,
};
