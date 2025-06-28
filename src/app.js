const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { ApolloServer } = require('apollo-server-express');
require("dotenv").config();

const logger = require("./utils/logger");
const { connectDB } = require("./utils/database");
const schedulerService = require("./utils/scheduler");
const { verifyToken } = require("./utils/jwt");
const { getUserById } = require("./models/user");

// GraphQL
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

// REST Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const likeRoutes = require("./routes/likes");

/**
 * Create Apollo GraphQL Server
 */
const createApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      // Get the user token from the headers
      const token = req.headers.authorization || '';
      
      // Try to retrieve a user with the token
      let user = null;
      if (token) {
        try {
          const decoded = verifyToken(token);
          user = await getUserById(decoded.userId);
        } catch (error) {
          // Token is invalid, but we don't throw an error
          // We just don't set a user in the context
        }
      }
      
      // Add the user to the context
      return { user };
    },
    introspection: true,
    playground: true,
    csrfPrevention: false,
    cache: 'bounded',
  });

  await server.start();
  return server;
};

/**
 * Express application setup and configuration
 */
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
	logger.critical("Unhandled error:", err);
	res.status(500).json({
		error: "Internal server error",
		...(process.env.NODE_ENV === "development" && { details: err.message }),
	});
});

/**
 * Start the server
 */
const startServer = async () => {
	try {
		await connectDB();
		
		// Create and apply Apollo GraphQL server
		const apolloServer = await createApolloServer();
		apolloServer.applyMiddleware({ app, path: '/graphql' });
		
		// 404 handler - MUST be after GraphQL middleware
		app.use("*", (req, res) => {
			res.status(404).json({ error: "Route not found" });
		});
		
		// Start the post scheduler
		schedulerService.start();
		
		app.listen(PORT, () => {
			logger.verbose(`Server is running on port ${PORT}`);
			logger.verbose(`GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
			logger.verbose(`GraphQL Playground: http://localhost:${PORT}${apolloServer.graphqlPath}`);
			logger.verbose(
				`Environment: ${process.env.NODE_ENV || "development"}`
			);
		});
	} catch (error) {
		logger.critical("Failed to start server:", error);
		console.error("Detailed error:", error);
		process.exit(1);
	}
};

startServer();

module.exports = app;
