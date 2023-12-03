const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store user information
const users = {};

app.use(express.static(path.join(__dirname, 'public')));

// Set a route handler for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle setting username and user selection
  socket.on('setUsername', (username) => {
    users[socket.id] = { username };
    io.emit('updateUsers', Object.values(users));
  });

  // Handle messages
  socket.on('message', (data) => {
    const { username } = users[socket.id];

    io.emit('message', { username, message: data.message, userId: socket.id });
  });

  // Handle disconnections
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
