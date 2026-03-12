import { io } from 'socket.io-client';

let socket;

export const initSocket = (userId) => {
    if (socket) return socket;

    socket = io(window.location.origin.replace('5173', '5000').replace('5174', '5000').replace('5175', '5000'), {
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
