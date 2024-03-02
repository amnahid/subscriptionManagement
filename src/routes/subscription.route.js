const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Subscription = require('../models/subscription.model');
const { isSubscriptionExpired } = require('../logic/subscription.logic');

// Create a new subscription
router.post('/',auth, async (req, res) => {
  try {
    const { key } = req.body;

    const newSubscription = new Subscription({
      key
    });

    const subscription = await newSubscription.save();
    res.json({...subscription, success:true});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Define routes
router.get('/', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.json(subscriptions);
  } catch (error) {
    console.error('Error retrieving subscriptions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all subscriptions of a user
router.get('/:key', async (req, res) => {
  try {
    const key = req.params.key;
    const subscriptionExpired = await isSubscriptionExpired(key);
    console.log(subscriptionExpired)
    if(subscriptionExpired){
      res.json({
        status: "expired"
      });
    } else {
      res.json({
        status: "active"
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Cancel a subscription
router.delete('/:key', auth, async (req, res) => {
  try {
    let subscription = await Subscription.findOne({key:req.params.key});

    if (!subscription) {
      return res.status(404).json({ msg: 'Subscription not found' });
    }

    // Check if the subscription belongs to the authenticated user
    // if (subscription.user.toString() !== req.user.id) {
    //   return res.status(401).json({ msg: 'User not authorized' });
    // }

    await Subscription.findOneAndDelete({key:req.params.key});

    res.json({ msg: 'Subscription removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
