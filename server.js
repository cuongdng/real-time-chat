import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const httpz = http.createServer(app);

const io = new Server(httpz, {
    cors: {
        origin: '*',
    },
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

let userList = new Map();

io.on('connection', (socket) => {
    let userName = socket.handshake.query.userName;
    addUser(userName, socket.id);

    socket.broadcast.emit('user-list', [...userList.keys()]);
    socket.emit('user-list', [...userList.keys()]);

    socket.on('message', (msg) => {
        socket.broadcast.emit('message-broadcast', { message: msg, userName: userName });
    });

    socket.on('disconnect', (reason) => {
        removeUser(userName, socket.id);
    });
});

function addUser(userName, id) {
    if (!userList.has(userName)) {
        userList.set(userName, new Set(id));
    } else {
        userList.get(userName).add(id);
    }
}

function removeUser(userName, id) {
    if (userList.has(userName)) {
        let userIds = userList.get(userName);
        if (userIds.size == 0) {
            userList.delete(userName);
        }
    }
}

httpz.listen(3000, () => {
    console.log('Server is running');
});
