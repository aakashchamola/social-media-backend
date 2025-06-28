const { getScheduledPostsToPublish } = require("../models/post");
const logger = require("./logger");

/**
 * Scheduler service to handle scheduled posts
 */
class SchedulerService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  /**
   * Start the scheduler
   * @param {number} intervalMs - Interval in milliseconds (default: 1 minute)
   */
  start(intervalMs = 60000) {
    if (this.isRunning) {
      logger.verbose("Scheduler is already running");
      return;
    }

    logger.verbose("Starting post scheduler...");
    this.isRunning = true;

    // Run immediately
    this.processScheduledPosts();

    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.processScheduledPosts();
    }, intervalMs);

    logger.verbose(`Post scheduler started with ${intervalMs}ms interval`);
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.verbose("Post scheduler stopped");
  }

  /**
   * Process scheduled posts that are ready to be published
   */
  async processScheduledPosts() {
    try {
      const publishedPosts = await getScheduledPostsToPublish();
      
      if (publishedPosts.length > 0) {
        logger.verbose(`Published ${publishedPosts.length} scheduled posts`);
        
        // Here you could add additional logic like:
        // - Sending notifications to followers
        // - Updating search indexes
        // - Triggering webhooks
        // - Analytics tracking
        
        publishedPosts.forEach(post => {
          logger.verbose(`Published scheduled post ${post.id} by user ${post.user_id}`);
        });
      }
    } catch (error) {
      logger.critical("Error processing scheduled posts:", error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId,
    };
  }
}

// Create singleton instance
const schedulerService = new SchedulerService();

module.exports = schedulerService;
