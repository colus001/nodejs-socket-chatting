var fs = require('fs');
var server = require('http').createServer();
var io = require('socket.io').listen(server);

server.listen(8081, function () {
  console.log('8081 Listening');
});

server.on('request', function (req, res) {
  fs.readFile('./views/index.html', function (err, data) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

io.sockets.on('connection', function (socket) {

  var name;

  // SETNAME
  socket.on('setname', function (data) {
    name = data;
  });

  // JOIN
  socket.on('join', function (data) {
    socket.join(data);
    socket.set('room', data);
    io.sockets.emit('room_made', data);
  });

  // MESSAGE
  socket.on('message', function (message) {

    // 메시지가 전송되면 룸에 들어와있는지 확인
    socket.get('room', function (err, room) {

      // 에러
      if (err) {
        console.log('error:', err);
        throw err;
      }

      var error_message;

      // 들어와있는 방이 없을 경우
      if (room === null) {
        error_message = '방에 입장해야해요';
        io.sockets.sockets[socket.id].emit('error', error_message);
        return;
      }

      // 대화명이 없을 경우
      if (name === undefined) {
        error_message = '대화명이 없어요';
        io.sockets.sockets[socket.id].emit('error', error_message);
        return;
      }

      console.log('room:', room);
      io.sockets.in(room).emit('message', name, message);

    });

  });

});