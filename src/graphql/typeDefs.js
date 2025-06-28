const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    username: String!
    email: String!
    full_name: String!
    created_at: DateTime!
    followers_count: Int
    following_count: Int
    posts_count: Int
    is_following: Boolean
    is_own_profile: Boolean
  }

  type Post {
    id: ID!
    content: String!
    media_url: String
    comments_enabled: Boolean!
    is_scheduled: Boolean!
    scheduled_at: DateTime
    created_at: DateTime!
    updated_at: DateTime!
    user_id: ID!
    username: String!
    full_name: String!
    likes_count: Int!
    comments_count: Int!
    is_liked_by_user: Boolean
  }

  type Comment {
    id: ID!
    content: String!
    created_at: DateTime!
    updated_at: DateTime!
    user_id: ID!
    username: String!
    full_name: String!
    post_id: ID!
  }

  type Like {
    id: ID!
    created_at: DateTime!
    user_id: ID!
    username: String!
    full_name: String!
    liked_at: DateTime!
  }

  type Follow {
    id: ID!
    username: String!
    full_name: String!
    created_at: DateTime!
    followed_at: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type FollowStats {
    followers_count: Int!
    following_count: Int!
  }

  type PaginationInfo {
    hasMore: Boolean!
    limit: Int!
    offset: Int!
  }

  type PostsResponse {
    posts: [Post!]!
    pagination: PaginationInfo!
  }

  type UsersResponse {
    users: [User!]!
    pagination: PaginationInfo!
  }

  type CommentsResponse {
    comments: [Comment!]!
    pagination: PaginationInfo!
  }

  type LikesResponse {
    likes: [Like!]!
    pagination: PaginationInfo!
  }

  type FollowsResponse {
    following: [Follow!]!
    pagination: PaginationInfo!
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    searchUsers(name: String!, limit: Int = 20, offset: Int = 0): UsersResponse!
    
    # Post queries
    post(id: ID!): Post
    feed(limit: Int = 20, offset: Int = 0): PostsResponse!
    myPosts(limit: Int = 20, offset: Int = 0): PostsResponse!
    userPosts(userId: ID!, limit: Int = 20, offset: Int = 0): PostsResponse!
    scheduledPosts(limit: Int = 20, offset: Int = 0): PostsResponse!
    
    # Follow queries
    followers(limit: Int = 20, offset: Int = 0): FollowsResponse!
    following(limit: Int = 20, offset: Int = 0): FollowsResponse!
    followStats: FollowStats!
    
    # Like queries
    postLikes(postId: ID!, limit: Int = 20, offset: Int = 0): LikesResponse!
    userLikes(userId: ID!, limit: Int = 20, offset: Int = 0): PostsResponse!
    
    # Comment queries
    postComments(postId: ID!, limit: Int = 20, offset: Int = 0): CommentsResponse!
  }

  type Mutation {
    # Authentication
    register(username: String!, email: String!, password: String!, full_name: String!): AuthPayload!
    login(username: String!, password: String!): AuthPayload!
    
    # Posts
    createPost(content: String!, media_url: String, comments_enabled: Boolean = true, scheduled_at: DateTime): Post!
    deletePost(id: ID!): Boolean!
    
    # Follow system
    followUser(userId: ID!): Boolean!
    unfollowUser(userId: ID!): Boolean!
    
    # Likes
    likePost(postId: ID!): Boolean!
    unlikePost(postId: ID!): Boolean!
    
    # Comments
    createComment(postId: ID!, content: String!): Comment!
    updateComment(id: ID!, content: String!): Comment!
    deleteComment(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
