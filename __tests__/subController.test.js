require('dotenv').config();
const subController = require('../server/controllers/subController');
const db = require('../server/models/dbModel');
jest.mock('../server/models/dbModel'); // Mock the database module
const { resetDatabase } = require('../server/models/dbModel');
const request = require('supertest');
const app = require('../server/server');

describe('subController', () => {
  let req, res, next;

  beforeEach(async () => {
    await resetDatabase();
    jest.resetAllMocks(); // Reset mocks to clear any previous state
  });

  afterEach(async () => {
    await resetDatabase();
  });

  beforeEach(() => {
    // Mock request object
    req = {
      params: {},
      body: {},
    };

    // Mock response object
    res = {
      locals: {}, // Initialize res.locals
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock next function
    next = jest.fn();
  });

  describe('createSub', () => {
    xit('should return 409 if an active subscription already exists', async () => {
      req.body = {
        userId: 1,
        industry: 'Beauty',
        source: 'News',
        subcategory: 'New Releases',
        active: true,
      };
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Mock finding an existing subscription

      await subController.createSub(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('should create a new subscription and return 201', async () => {
      console.log('Database URI used in test:', process.env.PG_URI);
      const newSubData = {
        userId: 4,
        industry: 'Tech',
        source: 'Web',
        subcategory: 'AI',
        active: true,
      };

      const response = await request(app)
        .post('/api/subs')
        .send(newSubData)
        .expect(201)
        .catch((err) => {
          console.log('Error response: ', err);
          throw err;
        });

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          ...newSubData,
        })
      );
    });

    xit('should handle database errors gracefully', async () => {
      req.body = {
        userId: 1,
        industry: 'Tech',
        source: 'Web',
        subcategory: 'AI',
        active: true,
      };
      db.query.mockRejectedValueOnce(new Error('Database failure'));

      await subController.createSub(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getSub', () => {
    xit('should return 200 and subscription data if found', async () => {
      req.params.userId = 1;
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, userId: 1 }] });

      await subController.getSub(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.anything());
    });

    xit('should return 404 if no subscriptions are found', async () => {
      req.params.userId = 1;
      db.query.mockResolvedValueOnce({ rows: [] });

      await subController.getSub(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // Additional tests for updateSub and deleteSub
});
