import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Settings routes', () => {
  it('GET /api/settings rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(401);
  });

  it('GET /api/settings/:key rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/settings/site_name');
    expect(res.status).toBe(401);
  });

  it('PUT /api/settings rejects unauthenticated requests', async () => {
    const res = await request(app)
      .put('/api/settings')
      .send([{ key: 'site_name', value: 'PWI', group: 'general' }]);
    expect(res.status).toBe(401);
  });
});
