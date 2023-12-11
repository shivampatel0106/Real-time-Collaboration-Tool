const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// To Store user information
const users = {};

app.use(express.static(path.join(__dirname, 'public')));

// To Set a route handler for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // To Handle setting username and user selection
  socket.on('setUsername', (username) => {
    users[socket.id] = { username };
    io.emit('updateUsers', Object.values(users));
  });

  // To Handle messages
  socket.on('message', (data) => {
    const { username } = users[socket.id];
    io.emit('message', { username, message: data.message, userId: socket.id });
  });

  // To Handle file sharing
  socket.on('file', (data) => {
    socket.broadcast.emit('file', data);
  });

  // To Handle emojis/reactions
  socket.on('emoji', (emoji) => {
    socket.broadcast.emit('emoji', emoji);
  });

  // To Handle typing indicator
  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('typing', { isTyping, userId: socket.id });
  });

  // To Handle disconnections
  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('updateUsers', Object.values(users));
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
