const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Security Middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(helmet());
    app.set('trust proxy', 1);
}
// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true
}));

app.use(cookieParser());
app.use(express.json({ extended: false }));

// Routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', require('./routes/uploads'));
app.use('/api/posts', require('./routes/post'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));

// Test route
app.get('/', (req, res) => res.send('API Running'));

// Global Error Handler
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.error('Server Error:', err.stack);
    }
    res.status(500).json({
        success: false,
        msg: 'Server error',
        error: err.message
    });
});

module.exports = app;
