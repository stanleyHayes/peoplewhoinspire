import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('API surface', () => {
  it('GET /api/health reports ok with a timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('unknown API routes return 404', async () => {
    const res = await request(app).get('/api/definitely-not-a-route');
    expect(res.status).toBe(404);
  });

  it('protected admin routes reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/dashboard');
    expect([401, 403, 404]).toContain(res.status);
    expect(res.status).not.toBe(200);
  });
});
