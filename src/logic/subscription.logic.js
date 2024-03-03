const Subscription = require('../models/subscription.model');

// Function to check if a user has an active subscription
async function hasActiveSubscription(key) {
  try {
    const subscription = await Subscription.findOne({
      key,
      // status: 'active',
      endDate: { $gte: new Date() } // Check if endDate is greater than or equal to today's date
    });

    return !!subscription; // Return true if subscription exists, otherwise false
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

// Function to determine the type of subscription a user has
async function getSubscriptionType(userId) {
  try {
    const subscription = await Subscription.findOne({ user: userId, status: 'active' });
    return subscription ? subscription.plan : 'no-subscription';
  } catch (error) {
    console.error('Error getting subscription type:', error);
    return 'error';
  }
}

// Function to calculate remaining subscription duration
async function getRemainingSubscriptionDuration(userId) {
  try {
    const subscription = await Subscription.findOne({ user: userId, status: 'active' });
    if (!subscription) return 0;

    const today = new Date();
    const remainingDays = Math.ceil((subscription.endDate - today) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return remainingDays;
  } catch (error) {
    console.error('Error calculating remaining subscription duration:', error);
    return 0;
  }
}

// Function to check if a subscription is expired
async function isSubscriptionExpired(key) {
  try {
    const subscription = await Subscription.findOne({ key, endDate: { $gte: new Date() } });
    if (subscription) {
      return false; // Return true if subscription exists and is expired, otherwise false
    } else {
      return true;
    }
  } catch (error) {
    console.error('Error checking subscription expiry:', error);
    return true;
  }
}

module.exports = {
  hasActiveSubscription,
  getSubscriptionType,
  getRemainingSubscriptionDuration,
  isSubscriptionExpired
};
