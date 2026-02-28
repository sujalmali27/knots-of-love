import cron from 'node-cron';
import Order from '../models/orderModel.js';

const startOrderCleanup = () => {
  // Runs every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      // Calculate the time 30 minutes ago
      const expirationTime = new Date(Date.now() - 30 * 60 * 1000);

      // Find and delete unpaid orders older than 30 mins
      const result = await Order.deleteMany({
        isPaid: false,
        createdAt: { $lt: expirationTime },
      });

      if (result.deletedCount > 0) {
        console.log(`🧹 Cleanup: Removed ${result.deletedCount} unpaid orders.`);
      }
    } catch (error) {
      console.error('Order cleanup error:', error);
    }
  });
};

export default startOrderCleanup;