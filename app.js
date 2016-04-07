'use strict';
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
let boardCache = null;
const chatCache = [];

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  io.emit('initBoard', boardCache);
  io.emit('initChat', chatCache);

  socket.on('draw', data => {
    socket.broadcast.emit('draw', data);
  });

  socket.on('clear', () => {
    socket.broadcast.emit('clear');
  });

  socket.on('cache', dataURL => {
    boardCache = dataURL;
  });

  socket.on('chat', message => {
    chatCache.push(message);
    io.emit('chat', message);
  });
});

server.listen(process.env.PORT || 3000);
