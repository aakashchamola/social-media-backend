const { Pool } = require("pg");
const logger = require("./logger");

let pool;

/**
 * Initialize database connection pool
 * @returns {Pool} PostgreSQL connection pool
 */
const initializePool = () => {
	if (!pool) {
		// Railway provides DATABASE_URL, but also support individual variables
		const databaseConfig = process.env.DATABASE_URL ? {
			connectionString: process.env.DATABASE_URL,
			ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
		} : {
			host: process.env.DB_HOST,
			port: process.env.DB_PORT,
			database: process.env.DB_NAME,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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
const query = async (text, params = []) => {
	const dbPool = initializePool();
	const start = Date.now();

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
		logger.critical("Database query error:", error);
		throw error;
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
