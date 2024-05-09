const { createSub } = require('../server/controllers/subController');
const db = require('../server/models/model');
jest.mock('../server/models/model');

describe('subController.createSub', () => {
  it('should return 409 if an active subscription already exists', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Mock finding an existing subscription
    const req = { body: { userId: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await createSub(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});
