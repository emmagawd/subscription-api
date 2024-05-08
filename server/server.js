const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const subscriptionRouter = require('./routes/subscriptionRouter');

/**
 * handle parsing request body
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Subscription API Running'));

/**
 * define route handlers
 */
app.use('/subscribe', subscriptionRouter);

// catch-all route handler for any requests to an unknown route
app.use((req, res) =>
  res.status(404).send("This is not the page you're looking for...")
);

/**
 * express error handler
 * @see https://expressjs.com/en/guide/error-handling.html#writing-error-handlers
 */

//any middleware that fails:
app.use((err, req, res, next) => {
  console.log('----> We are in the global error handler <----');
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

/**
 * start server
 */
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

module.exports = app;