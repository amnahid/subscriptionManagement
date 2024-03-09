const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Subscription = require('../models/subscription.model');
const { isSubscriptionExpired } = require('../logic/subscription.logic');
const subscriptionModel = require('../models/subscription.model');

// Create a new subscription
router.post('/', auth, async (req, res) => {
  try {
    const { key, user, deviceLimit, month } = req.body;

    const newSubscription = new Subscription({
      key, user, deviceLimit, month
    });

    const subscription = await newSubscription.save();
    res.json({ ...subscription._doc, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.patch('/:key', auth, async (req, res) => {
  try {
    const { user, deviceLimit, month, status } = req.body;
    const key = req.params.key;

    console.log(req.body)
    const setMonth = Number(month);
    const setDeviceLimit = Number(deviceLimit);

    const newSubscription = { user, month: setMonth, deviceLimit:setDeviceLimit , status };

    const subscription = await Subscription.findOneAndUpdate({ key }, { ...newSubscription }, { new: true });
    res.json({ ...subscription._doc, success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

})


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
    const deviceId = req.body.deviceId;
    const key = req.params.key;
    const subscriptionExpired = await isSubscriptionExpired(key);
    if (deviceId) {
      const keyDetails = await subscriptionModel.findOne({ key })
      keyDetails.Logs.push({ time: Date.now(), deviceId })
      await keyDetails.save()
      if (keyDetails.deviceList.indexOf(deviceId) == -1) {
        if (keyDetails.deviceList.length < keyDetails.deviceLimit) {
          keyDetails.deviceList.push(deviceId);
          await keyDetails.save()
          if (subscriptionExpired) {
            res.json({
              status: "expired"
            });
          } else {
            res.json({
              status: "active"
            });
          }
        } else {
          keyDetails.status = "inactive"
          await keyDetails.save()
          res.json({
            status: "expired",
            msg: "Device limit crossed. Your license key has been blocked"
            // msg: "Device limit crossed"
          });
        }
      } else {
        if (subscriptionExpired) {
          res.json({
            status: "expired"
          });
        } else {
          res.json({
            status: "active"
          });
        }
      }

    } else {
      res.json({
        status: "expired",
        // msg:"Device limit crossed. Your license key has been blocked"
        msg: "Invalid request"
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
    let subscription = await Subscription.findOne({ key: req.params.key });

    if (!subscription) {
      return res.status(404).json({ msg: 'Subscription not found' });
    }

    // Check if the subscription belongs to the authenticated user
    // if (subscription.user.toString() !== req.user.id) {
    //   return res.status(401).json({ msg: 'User not authorized' });
    // }

    await Subscription.findOneAndDelete({ key: req.params.key });

    res.json({ msg: 'Subscription removed', success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/details/:key', auth, async (req, res) => {
  try {
    const key = req.params.key
    const keyDetails = await subscriptionModel.findOne({ key })
    res.json(keyDetails)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

module.exports = router;
