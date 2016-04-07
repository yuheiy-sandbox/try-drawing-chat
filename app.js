'use strict';
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server litening at port ' + port);
});

app.use(express.static(path.join(__dirname, 'public')));

const boardIO = io.of('/board');
let boardCache = null;

boardIO.on('connection', socket => {
  boardIO.emit('init', boardCache);

  socket.on('draw', (tool, points) => {
    socket.broadcast.emit('draw', tool, points);
  });

  socket.on('clear all', () => {
    socket.broadcast.emit('clear all');
  });

  socket.on('save cache', dataURL => {
    boardCache = dataURL;
  });
});

const chatIO = io.of('/chat');
const chatCache = [];

chatIO.on('connection', socket => {
  chatIO.emit('init', chatCache);

  socket.on('new message', text => {
    const message = {
      text: text,
      date: Date.now()
    };

    chatCache.push(message);
    chatIO.emit('new message', message);
  });
});

server.listen(process.env.PORT || 3000);
