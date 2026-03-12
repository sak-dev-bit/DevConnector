const socketIo = require('socket.io');

let io;
const users = new Map(); // Store userId -> socketId mapping

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? process.env.CLIENT_URL
                : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join', (userId) => {
            if (userId) {
                users.set(userId, socket.id);
                console.log(`User ${userId} joined with socket ${socket.id}`);
            }
        });

        socket.on('disconnect', () => {
            for (const [userId, socketId] of users.entries()) {
                if (socketId === socket.id) {
                    users.delete(userId);
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

const sendNotification = (userId, type, data) => {
    if (!io) return;
    const socketId = users.get(userId.toString());
    if (socketId) {
        io.to(socketId).emit('notification', { type, ...data });
    }
};

module.exports = {
    initSocket,
    getIo,
    sendNotification
};
