const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(__dirname + '/Users/sampatel/Documents/real-timecollaborationtool/Main/index.html'));

let users = {}; 

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });
});

io.on('connection', (socket) => {
  console.log('New user connected');

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

  socket.on('join', (data) => {
    users[socket.id] = {
      color: data.color,
      lineWidth: data.lineWidth
    };
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
