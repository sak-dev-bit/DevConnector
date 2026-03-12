const request = require('supertest');
const app = require('../app');
const dbHandler = require('./setup');
const User = require('../models/User');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.disconnect());

describe('Profile Routes', () => {
    let token;
    let userId;

    beforeEach(async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Profile User',
                email: 'profile@example.com',
                password: 'Password123'
            });
        token = res.body.token;
        userId = res.body.user?.id;
    });

    describe('GET /api/profile/me', () => {
        it('should return 404 if no profile exists for user', async () => {
            const res = await request(app)
                .get('/api/profile/me')
                .set('x-auth-token', token);

            expect(res.statusCode).toBe(404);
            expect(res.body.msg).toBe('There is no profile for this user');
        });
    });

    describe('POST /api/profile', () => {
        it('should create a new profile successfully', async () => {
            const profileData = {
                status: 'Developer',
                skills: 'JavaScript, Node, Express'
            };

            const res = await request(app)
                .post('/api/profile')
                .set('x-auth-token', token)
                .send(profileData);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('Developer');
            expect(res.body.skills).toContain('JavaScript');
        });

        it('should fail if required fields are missing', async () => {
            const profileData = {
                company: 'NASA'
            };

            const res = await request(app)
                .post('/api/profile')
                .set('x-auth-token', token)
                .send(profileData);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});
