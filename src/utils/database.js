const { Pool } = require("pg");
const logger = require("./logger");

let pool;

/**
 * Initialize database connection pool
 * @returns {Pool} PostgreSQL connection pool
 */
const initializePool = () => {
	if (!pool) {
		// Priority: DATABASE_URL (Railway) > individual env vars (local)
		const databaseConfig = process.env.DATABASE_URL ? {
			connectionString: process.env.DATABASE_URL,
			ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
		} : {
			host: process.env.DB_HOST || 'localhost',
			port: process.env.DB_PORT || 5432,
			database: process.env.DB_NAME || 'social_media_db',
			user: process.env.DB_USER || 'postgres',
			password: process.env.DB_PASSWORD || '',
			ssl: false
		};

		pool = new Pool({
			...databaseConfig,
			max: process.env.NODE_ENV === 'production' ? 20 : 5,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: process.env.NODE_ENV === 'production' ? 10000 : 2000,
		});

		pool.on("error", (err) => {
			logger.critical("Unexpected error on idle client", err);
		});

		logger.verbose("Pool stats", {
  total: pool.totalCount,
  idle: pool.idleCount,
  waiting: pool.waitingCount,
});


		// Log connection configuration (without sensitive data)
		logger.verbose(`Database configuration: ${process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Using individual env vars'}`);
	}
	return pool;
};



/**
 * Connect to the database and test connection
 */
const connectDB = async () => {
	try {
		const dbPool = initializePool();
		const client = await dbPool.connect();
		logger.verbose("Connected to PostgreSQL database");
		client.release();
	} catch (error) {
		logger.critical("Failed to connect to database:", error);
		throw error;
	}
};

/**
 * Execute a database query
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const isTransientError = (err) =>
	err.message?.includes("Connection terminated") ||
	err.message?.includes("timeout") ||
	err.code === 'ECONNRESET' ||
	err.code === '57P01';
	const query = async (text, params = [], retries = 2) => {
	const dbPool = initializePool();
	const start = Date.now();

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			const result = await dbPool.query(text, params);
			const duration = Date.now() - start;
			logger.verbose("Executed query", {
				text,
				duration,
				rows: result.rowCount,
			});
			return result;
		} catch (error) {
			if (attempt === retries || !isTransientError(error)) {
				logger.critical("Database query error:", error);
				throw error;
			}
			logger.warn(`Transient DB error (attempt ${attempt + 1}):`, error.message);
			await new Promise((r) => setTimeout(r, 1000)); // wait before retry
		}
	}
};

/**
 * Get a database client for transactions
 * @returns {Promise<Object>} Database client
 */
const getClient = async () => {
	const dbPool = initializePool();
	return await dbPool.connect();
};

module.exports = {
	connectDB,
	query,
	getClient,
};
