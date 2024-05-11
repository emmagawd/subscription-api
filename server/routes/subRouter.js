const express = require('express');
const subRouter = express.Router();
const subController = require('../controllers/subController');

// Create Subscription:
subRouter.post('/subs', subController.createSub, (req, res) => {
  return res.status(201).json(res.locals.newSub);
});

// Fetch Subscription:
subRouter.get('/subs/:userId', subController.getSub, (req, res) => {
  return res.status(200).json(res.locals.fetchedSub);
});

// Update Subscription:
subRouter.patch(
  '/subs/:subscriptionId',
  subController.updateSub,
  (req, res) => {
    return res.status(201).json(res.locals.updatedSub);
  }
);

// Cancel Subscription:
subRouter.delete(
  '/subs/:subscriptionId',
  subController.deleteSub,
  (req, res) => {
    return res.status(201).json(res.locals.deletedSub);
  }
);

module.exports = subRouter;
//done
