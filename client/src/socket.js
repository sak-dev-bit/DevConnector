import { io } from 'socket.io-client';

let socket;
const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const initSocket = (userId) => {
    if (socket) return socket;

    socket = io(socketUrl, {
        withCredentials: true,
    });

    socket.on('connect', () => {
        console.log('Connected to socket server');
        socket.emit('join', userId);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
