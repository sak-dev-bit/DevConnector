const request = require('supertest');
const app = require('../app');
const dbHandler = require('./setup');
const User = require('../models/User');

const http = require('http');
let server;

beforeAll(async () => {
    await dbHandler.connect();
    server = http.createServer(app);
});
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => {
    await dbHandler.disconnect();
});

describe('Auth Routes', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(server)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123'
                });
            if (res.statusCode !== 201) console.log('Register failed body:', res.body);
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.header['set-cookie']).toBeDefined(); // Refresh token cookie

            const user = await User.findOne({ email: 'test@example.com' });
            expect(user).toBeTruthy();
        });

        it('should fail with invalid email', async () => {
            const res = await request(server)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'invalid-email',
                    password: 'Password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should fail if user already exists', async () => {
            await User.create({
                name: 'Existing User',
                email: 'test@example.com',
                password: 'Password123'
            });

            const res = await request(server)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.msg).toBe('User already exists with this email');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Manual creation bypassing bcrypt for raw test if needed, 
            // but register route is better to test integration.
            await request(server).post('/api/auth/register').send({
                name: 'Login User',
                email: 'login@example.com',
                password: 'Password123'
            });
        });

        it('should login successfully with correct credentials', async () => {
            const res = await request(server)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'Password123'
                });

            if (res.statusCode !== 200) console.log('Login failed body:', res.body);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });

        it('should fail with incorrect password', async () => {
            const res = await request(server)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'WrongPassword123'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.msg).toBe('Invalid credentials');
        });
    });
});
