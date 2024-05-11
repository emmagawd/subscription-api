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
    });
  });
});
