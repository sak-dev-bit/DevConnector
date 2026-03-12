const { z } = require('zod');

const authSchemas = {
    register: z.object({
        body: z.object({
            name: z.string().min(2, 'Name must be at least 2 characters').max(50),
            email: z.string().email('Please provide a valid email'),
            password: z.string()
                .min(6, 'Password must be at least 6 characters')
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase, lowercase, and number'),
        }),
    }),
    login: z.object({
        body: z.object({
            email: z.string().email('Please provide a valid email'),
            password: z.string().min(1, 'Password is required'),
        }),
    }),
};

const profileSchemas = {
    upsert: z.object({
        body: z.object({
            status: z.string().min(1, 'Status is required'),
            skills: z.union([z.string(), z.array(z.string())]).transform((val) => {
                if (Array.isArray(val)) return val;
                return val.split(',').map((skill) => skill.trim());
            }),
            company: z.string().optional(),
            website: z.string().url('Invalid URL').optional().or(z.literal('')),
            location: z.string().optional(),
            bio: z.string().optional(),
            githubusername: z.string().optional(),
            youtube: z.string().url('Invalid URL').optional().or(z.literal('')),
            twitter: z.string().url('Invalid URL').optional().or(z.literal('')),
            facebook: z.string().url('Invalid URL').optional().or(z.literal('')),
            linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
            instagram: z.string().url('Invalid URL').optional().or(z.literal('')),
        }),
    }),
};

const postSchemas = {
    create: z.object({
        body: z.object({
            text: z.string().min(1, 'Text is required').max(1000),
        }),
    }),
    comment: z.object({
        body: z.object({
            text: z.string().min(1, 'Text is required').max(500),
        }),
    }),
};

module.exports = {
    authSchemas,
    profileSchemas,
    postSchemas,
};
