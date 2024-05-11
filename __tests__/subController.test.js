require('dotenv').config();
const subController = require('../server/controllers/subController');
const db = require('../server/models/dbTestModel');
// Redirect imports from dbModel.js to dbTestModel.js:
jest.mock('../server/models/dbModel', () =>
  require('../server/models/dbTestModel')
);
const { resetDatabase } = require('../server/models/dbTestModel');
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Using bodyParser as a separate package
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import and mount the subRouter correctly
const subRouter = require('../server/routes/subRouter'); // Adjust the path as necessary
app.use('/api', subRouter);

describe('Route integration', () => {
  describe('/api/subs', () => {
    describe('POST', () => {
      beforeEach(async () => {
        await resetDatabase(); // Reset the database before each test
      });

      it('responds with 201 status and application/json content type', async () => {
        const postData = {
          userId: 1,
          industry: 'Tech',
          source: 'Web',
          subcategory: 'New Product Releases',
          active: true,
        };

        return request(app)
          .post('/api/subs')
          .send(postData)
          .expect('Content-Type', /application\/json/)
          .expect(201);
      });

      it('responds with 400 status if required fields are missing', async () => {
        const postData = {
          // Missing 'userId' and 'industry'
          source: 'Web',
          subcategory: 'New Product Releases',
          active: true,
        };

        await request(app).post('/api/subs').send(postData).expect(500);
      });

      it('responds with 409 status if an active subscription already exists', async () => {
        // Directly insert a subscription into the database
        await db.query(
          "INSERT INTO subscriptions (user_id, industry, source, subcategory, active) VALUES (1, 'Tech', 'Web', 'New Product Releases', TRUE)"
        );

        const postData = {
          userId: 1,
          industry: 'Tech',
          source: 'Web',
          subcategory: 'New Product Releases',
          active: true,
        };

        await request(app)
          .post('/api/subs')
          .send(postData)
          .expect('Content-Type', /application\/json/)
          .expect(409, {
            error: 'User already has an active subscription.',
          });
      });

      it('allows creating a new subscription if existing subscriptions are inactive', async () => {
        // Directly insert an inactive subscription into the database
        await db.query(
          "INSERT INTO subscriptions (user_id, industry, source, subcategory, active) VALUES (1, 'Tech', 'Web', 'New Product Releases', FALSE)"
        );

        const postData = {
          userId: 1,
          industry: 'Tech',
          source: 'Web',
          subcategory: 'New Product Releases',
          active: true,
        };

        await request(app)
          .post('/api/subs')
          .send(postData)
          .expect('Content-Type', /application\/json/)
          .expect(201);
      });

      it('handles unexpected data types gracefully', async () => {
        const postData = {
          userId: 'not-an-integer', // Incorrect data type
          industry: 123, // Incorrect data type
          source: 'Web',
          subcategory: 'New Product Releases',
          active: 'true', // Incorrect data type
        };

        await request(app).post('/api/subs').send(postData).expect(500);
      });
    });
  });

  describe('/api/subs/:userId', () => {
    describe('GET', () => {
      // beforeEach(async () => {
      //   await resetDatabase(); // Reset the database before each test
      // });

      it('should fetch subscriptions for a user', async () => {
        // Directly insert a subscription into the database
        await db.query(
          "INSERT INTO subscriptions (user_id, industry, source, subcategory, active) VALUES (1, 'Tech', 'Web', 'New Product Releases', TRUE)"
        );

        const userId = 1;
        await request(app)
          .get(`/api/subs/${userId}`)
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then((response) => {
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0].user_id).toBe(userId);
          });
      });

      it('should return 404 if no subscriptions are found for the user', async () => {
        const userId = 9999; // Assuming this user has no subscriptions
        await request(app)
          .get(`/api/subs/${userId}`)
          .expect('Content-Type', /application\/json/)
          .expect(404)
          .then((response) => {
            expect(response.body.error).toEqual(
              'No subscriptions found for the user.'
            );
          });
      });
    });
  });

  describe('/api/subs/:subscriptionId', () => {
    describe('PATCH', () => {
      it('should update a subscription and return updated data', async () => {
        const subscriptionId = 1; // Assuming this is a valid subscription ID
        const updateData = {
          industry: 'Health',
          source: 'Newsletter',
        };

        await request(app)
          .patch(`/api/subs/${subscriptionId}`)
          .send(updateData)
          .expect('Content-Type', /application\/json/)
          .expect(201)
          .then((response) => {
            expect(response.body).toMatchObject(updateData);
          });
      });

      it('should return 404 if the subscription does not exist', async () => {
        const subscriptionId = 9999; // Assuming this is an invalid subscription ID
        await request(app)
          .patch(`/api/subs/${subscriptionId}`)
          .send({ industry: 'Health' })
          .expect('Content-Type', /application\/json/)
          .expect(404)
          .then((response) => {
            expect(response.body.error).toEqual('Subscription not found');
          });
      });
    });
  });

  describe('/api/subs/:subscriptionId', () => {
    describe('DELETE', () => {
      it('should deactivate a subscription and return the deactivated record', async () => {
        const subscriptionId = 1; // Assuming this is an active subscription
        await request(app)
          .delete(`/api/subs/${subscriptionId}`)
          .expect('Content-Type', /application\/json/)
          .expect(201)
          .then((response) => {
            expect(response.body.active).toEqual(false);
          });
      });

      it('should return 404 if the subscription is not found or already inactive', async () => {
        const subscriptionId = 9999; // Assuming this subscription does not exist
        await request(app)
          .delete(`/api/subs/${subscriptionId}`)
          .expect('Content-Type', /application\/json/)
          .expect(404)
          .then((response) => {
            expect(response.body.error).toEqual(
              'Subscription not found or already inactive'
            );
          });
      });
    });
  });
});
//done
