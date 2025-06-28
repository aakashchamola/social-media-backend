const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { DateTimeResolver } = require('graphql-scalars');

// Import existing controllers/models
const { register, login, getProfile } = require('../controllers/auth');
const { createUser, getUserByUsername, getUserById, findUsersByName, getUserProfile } = require('../models/user');
const { 
  followUser: followUserModel, 
  unfollowUser: unfollowUserModel, 
  getFollowing, 
  getFollowers, 
  getFollowCounts,
  isFollowing 
} = require('../models/follow');
const {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  getFeedPosts,
  getScheduledPosts,
} = require('../models/post');
const { 
  likePost, 
  unlikePost, 
  getPostLikes, 
  getUserLikes, 
  hasUserLikedPost 
} = require('../models/like');
const { 
  createComment, 
  updateComment, 
  deleteComment, 
  getPostComments, 
  getCommentById 
} = require('../models/comment');
const { generateToken, verifyToken } = require('../utils/jwt');

const resolvers = {
  DateTime: DateTimeResolver,

  Query: {
    // User queries
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return await getUserProfile(user.id);
    },

    user: async (_, { id }, { user }) => {
      const profile = await getUserProfile(parseInt(id));
      if (!profile) throw new UserInputError('User not found');
      
      // Check if current user is following this user
      let isFollowingUser = false;
      if (user && user.id !== parseInt(id)) {
        isFollowingUser = await isFollowing(user.id, parseInt(id));
      }
      
      return {
        ...profile,
        is_following: isFollowingUser,
        is_own_profile: user?.id === parseInt(id)
      };
    },

    searchUsers: async (_, { name, limit, offset }) => {
      if (!name || name.trim().length < 2) {
        throw new UserInputError('Search term must be at least 2 characters long');
      }
      const users = await findUsersByName(name.trim(), limit, offset);
      return {
        users,
        pagination: {
          limit,
          offset,
          hasMore: users.length === limit
        }
      };
    },

    // Post queries
    post: async (_, { id }, { user }) => {
      const post = await getPostById(parseInt(id));
      if (!post) throw new UserInputError('Post not found');
      
      // Add user interaction info
      if (user) {
        post.is_liked_by_user = await hasUserLikedPost(user.id, parseInt(id));
      }
      
      return post;
    },

    feed: async (_, { limit, offset }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      const posts = await getFeedPosts(user.id, limit, offset);
      return {
        posts,
        pagination: {
          limit,
          offset,
          hasMore: posts.length === limit
        }
      };
    },

    myPosts: async (_, { limit, offset }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      const posts = await getPostsByUserId(user.id, limit, offset);
      return {
        posts,
        pagination: {
          limit,
          offset,
          hasMore: posts.length === limit
        }
      };
    },

    userPosts: async (_, { userId, limit, offset }) => {
      const posts = await getPostsByUserId(parseInt(userId), limit, offset);
      return {
        posts,
        pagination: {
          limit,
          offset,
          hasMore: posts.length === limit
        }
      };
    },

    scheduledPosts: async (_, { limit, offset }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      const posts = await getScheduledPosts(user.id, limit, offset);
      return {
        posts,
        pagination: {
          limit,
          offset,
          hasMore: posts.length === limit
        }
      };
    },

    // Follow queries
    followers: async (_, { limit, offset }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      const followers = await getFollowers(user.id, limit, offset);
      return {
        following: followers,
        pagination: {
          limit,
          offset,
          hasMore: followers.length === limit
        }
      };
    },

    following: async (_, { limit, offset }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      const following = await getFollowing(user.id, limit, offset);
      return {
        following,
        pagination: {
          limit,
          offset,
          hasMore: following.length === limit
        }
      };
    },

    followStats: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      const stats = await getFollowCounts(user.id);
      return {
        followers_count: parseInt(stats.followers_count),
        following_count: parseInt(stats.following_count)
      };
    },

    // Like queries
    postLikes: async (_, { postId, limit, offset }) => {
      const likes = await getPostLikes(parseInt(postId), limit, offset);
      return {
        likes,
        pagination: {
          limit,
          offset,
          hasMore: likes.length === limit
        }
      };
    },

    userLikes: async (_, { userId, limit, offset }) => {
      const posts = await getUserLikes(parseInt(userId), limit, offset);
      return {
        posts,
        pagination: {
          limit,
          offset,
          hasMore: posts.length === limit
        }
      };
    },

    // Comment queries
    postComments: async (_, { postId, limit, offset }) => {
      const comments = await getPostComments(parseInt(postId), limit, offset);
      return {
        comments,
        pagination: {
          limit,
          offset,
          hasMore: comments.length === limit
        }
      };
    },
  },

  Mutation: {
    // Authentication
    register: async (_, { username, email, password, full_name }) => {
      try {
        const user = await createUser({ username, email, password, full_name });
        const token = generateToken({
          userId: user.id,
          username: user.username,
        });
        return { token, user };
      } catch (error) {
        throw new UserInputError('Registration failed: ' + error.message);
      }
    },

    login: async (_, { username, password }) => {
      const user = await getUserByUsername(username);
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = generateToken({
        userId: user.id,
        username: user.username,
      });

      return { token, user };
    },

    // Posts
    createPost: async (_, { content, media_url, comments_enabled, scheduled_at }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const post = await createPost({
        user_id: user.id,
        content,
        media_url,
        comments_enabled,
        scheduled_at,
      });
      
      // Return post with user information directly
      return {
        ...post,
        username: user.username,
        full_name: user.full_name,
        likes_count: 0,
        comments_count: 0,
        is_liked_by_user: false
      };
    },

    deletePost: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      const success = await deletePost(parseInt(id), user.id);
      if (!success) throw new ForbiddenError('Post not found or unauthorized');
      return true;
    },

    // Follow system
    followUser: async (_, { userId }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      if (parseInt(userId) === user.id) {
        throw new UserInputError('Cannot follow yourself');
      }

      const targetUser = await getUserProfile(parseInt(userId));
      if (!targetUser) throw new UserInputError('User not found');

      const alreadyFollowing = await isFollowing(user.id, parseInt(userId));
      if (alreadyFollowing) throw new UserInputError('Already following this user');

      await followUserModel(user.id, parseInt(userId));
      return true;
    },

    unfollowUser: async (_, { userId }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      const success = await unfollowUserModel(user.id, parseInt(userId));
      if (!success) throw new UserInputError('Not following this user');
      return true;
    },

    // Likes
    likePost: async (_, { postId }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const alreadyLiked = await hasUserLikedPost(user.id, parseInt(postId));
      if (alreadyLiked) throw new UserInputError('Post already liked');

      const like = await likePost(user.id, parseInt(postId));
      if (!like) throw new UserInputError('Post may not exist');
      return true;
    },

    unlikePost: async (_, { postId }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      const success = await unlikePost(user.id, parseInt(postId));
      if (!success) throw new UserInputError('Post not liked or doesn\'t exist');
      return true;
    },

    // Comments
    createComment: async (_, { postId, content }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const comment = await createComment(user.id, parseInt(postId), content);
      
      // Return comment with user information
      return {
        ...comment,
        username: user.username,
        full_name: user.full_name
      };
    },

    updateComment: async (_, { id, content }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const updatedComment = await updateComment(parseInt(id), user.id, content);
      if (!updatedComment) {
        throw new ForbiddenError('Comment not found or you don\'t have permission to edit it');
      }
      return updatedComment;
    },

    deleteComment: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const success = await deleteComment(parseInt(id), user.id);
      if (!success) {
        throw new ForbiddenError('Comment not found or you don\'t have permission to delete it');
      }
      return true;
    },
  },
};

module.exports = resolvers;
