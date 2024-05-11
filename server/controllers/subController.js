const db = require('../models/dbModel');

const subController = {};

// Create Subscription (Ensure no active subscriptions exist for the user before creating a new one):
subController.createSub = async (req, res, next) => {
  const { userId } = req.body; // Assuming the userId is sent in the request body
  const { industry, source, subcategory } = req.body; // Extract other necessary fields

  console.log('req.body: ', req.body);

  const checkQuery =
    'SELECT * FROM subscriptions WHERE user_id = $1 AND active = TRUE';

  try {
    const existingSub = await db.query(checkQuery, [userId]);
    console.log('existingSub: ', existingSub);
    if (existingSub.rows.length > 0) {
      console.log('Active sub already exists!');
      return res
        .status(409)
        .json({ error: 'User already has an active subscription.' });
    }

    // If no active subscription, proceed to create a new one
    const insertQuery = `
            INSERT INTO subscriptions (user_id, industry, source, subcategory, active)
            VALUES ($1, $2, $3, $4, TRUE)
            RETURNING *;
        `;

    const newSub = await db.query(insertQuery, [
      userId,
      industry,
      source,
      subcategory,
    ]);
    console.log('newSub: ', newSub);
    res.locals.newSub = newSub.rows[0];
    return next();
  } catch (err) {
    return next({
      log: `Error in subController.createSub middleware. ERROR: ${err}`,
      status: 500,
      message: { err: 'Error creating subscription in database.' },
    });
  }
};

// Fetch Subscription (Retrieve subscription details for a user):
subController.getSub = async (req, res, next) => {
  const { userId } = req.params; // :userId
  // query db for all subscriptions related to the user id;
  const query = 'SELECT * FROM subscriptions WHERE user_id = $1';

  try {
    const subscriptions = await db.query(query, [userId]);
    if (subscriptions.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'No subscriptions found for the user.' });
    }
    res.locals.fetchedSub = subscriptions.rows;
    return next();
  } catch (err) {
    return next({
      log: `Error in subController getSub middleware. ERROR: ${err}`,
      status: 500,
      message: { err: 'Error retrieving subscription data from database.' },
    });
  }
};

// Update Subscription (Allow users to update their subscription details):
subController.updateSub = async (req, res, next) => {
  const { subscriptionId } = req.params; // :subscriptionId
  const updateData = req.body; // This should contain any of the fields that need to be updated

  // Construct the SQL query dynamically based on what's provided in updateData
  const fields = Object.keys(updateData);
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No update data provided' });
  }

  const baseQuery = 'UPDATE subscriptions SET ';
  const set = [];
  const values = [];

  fields.forEach((field, index) => {
    set.push(`${field} = $${index + 1}`);
    values.push(updateData[field]);
  });

  const query = `${baseQuery} ${set.join(', ')} WHERE id = $${
    fields.length + 1
  } RETURNING *;`;

  try {
    values.push(subscriptionId); // Add subscriptionId as the last parameter for the WHERE clause
    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.locals.updatedSub = result.rows[0]; // Store the updated subscription in res.locals
    return next();
  } catch (err) {
    return next({
      log: `Error in subController.updateSub middleware. ERROR: ${err}`,
      status: 500,
      message: { err: 'Error updating subscription in database.' },
    });
  }
};

// Cancel Subscription (Soft delete or deactivate a subscription):
subController.deleteSub = async (req, res, next) => {
  const { subscriptionId } = req.params; // :subscriptionId

  // SQL query to soft delete (deactivate) the subscription
  // Return the updated subscription
  const query = `
  UPDATE subscriptions
  SET active = FALSE  
  WHERE id = $1 AND active = TRUE
  RETURNING *;  
`;

  try {
    const result = await db.query(query, [subscriptionId]);
    if (result.rows.length === 0) {
      // No rows updated, likely because the subscription was already inactive or did not exist
      return res
        .status(404)
        .json({ error: 'Subscription not found or already inactive' });
    }

    // Store in res.locals if performing further actions or logging after deactivating the subscription
    res.locals.deletedSub = result.rows[0];
    return next();
  } catch (err) {
    return next({
      log: `Error in subController.deleteSub middleware. ERROR: ${err}`,
      status: 500,
      message: { err: 'Error deactivating subscription in database.' },
    });
  }
};

module.exports = subController;
//done
