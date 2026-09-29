import request from 'supertest';
import { app } from '../src/index.js';

describe('Auth Endpoints', () => {
    it('should return 401 if accessing protected route without token', async () => {
        const response = await request(app).get('/api/auth/check');
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized - No Token Provided');
    });

    it('should return 401 if accessing refresh token route without token', async () => {
        const response = await request(app).post('/api/auth/refresh');
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'No refresh token provided');
    });
});
