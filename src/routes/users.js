const express = require("express");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * User-related routes
 * TODO: Implement user routes when follow functionality is added
 */

// TODO: POST /api/users/follow - Follow a user
// TODO: DELETE /api/users/unfollow - Unfollow a user
// TODO: GET /api/users/following - Get users that current user follows
// TODO: GET /api/users/followers - Get users that follow current user
// TODO: GET /api/users/stats - Get follow stats for current user
// TODO: POST /api/users/search - Find users by name

module.exports = router;
