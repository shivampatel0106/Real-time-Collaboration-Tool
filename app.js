const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

let users = {};

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('join', (username) => {
    users[socket.id] = { username, color: '#000000', lineWidth: 5 };
    io.emit('userJoined', { username, id: socket.id });
  });

  socket.on('message', (data) => {
    io.emit('message', { username: users[socket.id].username, message: data });
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      delete users[socket.id];
      io.emit('userLeft', { username });
    }
  });

  // Handle draw events for collaborative whiteboard
  socket.on('draw', (data) => {
    if (users[socket.id]) {
      socket.broadcast.emit('draw', {
        x: data.x,
        y: data.y,
        drawing: data.drawing,
        color: users[socket.id].color,
        lineWidth: users[socket.id].lineWidth
      });
    }
  });

  socket.on('clear', () => {
    io.emit('clear');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
