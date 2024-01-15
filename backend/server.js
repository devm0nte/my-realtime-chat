const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

// VARIABLES
const fixChatRoom = "chatroom"
let roomUser = {}

// Handler
const findUserObj = (objArr, id) => {
  return (!objArr || !objArr.length) ? null : objArr.find(obj => obj.id === id);
}

const findIdxUserObj = (objArr, id) => {
  return (!objArr || !objArr.length) ? -1 : objArr.findIndex(obj => obj.id === id);
}

const delUserOut = (objArr, id) => {
  const foundIdx = (!objArr || !objArr.length) ? -1 : objArr.findIndex(obj => obj.id === id);
  if (foundIdx >= 0) {
    objArr.splice(foundIdx, 1);
  }
}

const handleMessageObj = (user, message) => {

  return !user ? null : {
    id: user.id,
    username: user.name,
    message: message,
    datetime: new Date().getTime(),
  }
}

// SOCKETIO
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('statusAlert', `Your ID: ${socket.id}`);

  socket.on('join', (username) => {
    if (username) {
      // Find Username in local
      const userInChatRoom = roomUser[fixChatRoom] || []

      const found = findUserObj(userInChatRoom, socket.id);
      const userObj = {
        id: socket.id,
        name: username
      }

      if (found) {
        socket.emit('statusAlert', "You already joined");
      } else {
        socket.join(fixChatRoom)

        userInChatRoom.push(userObj)
        // SET BACK user room
        roomUser[fixChatRoom] = userInChatRoom

        socket.to(fixChatRoom).emit('statusAlert', `${username}  joined in the room`)
        // SEND STATUS JOINED TO ACKNOWLEDGE CLIENT
        socket.emit('isJoined', true);

      }
    } else {
      socket.emit('statusAlert', "enter name please")
    }
    console.log(roomUser)
  })

  socket.on('receiveMessage', (message) => {
    console.log('got message', message);
  })

  socket.on('edit-name', (name) => {
    const foundIdx = findIdxUserObj(roomUser[fixChatRoom], socket.id)
    console.log('found', foundIdx);
    if (foundIdx >= 0) {
      // const oldName = roomUser[fixChatRoom][foundIdx]["name"]
      roomUser[fixChatRoom][foundIdx]["name"] = name
      socket.emit("edit-name-callback", name)
    } else {
      socket.emit("edit-name-callback", null)
    }

  })

  socket.on('sendMsg', (message) => {

    const msg = handleMessageObj((findUserObj(roomUser[fixChatRoom], socket.id)), message)
    console.log("SEND MESSAGE", msg)
    if (msg) {
      io.to(fixChatRoom).emit('receiveMessage', msg);
    } else {
      socket.emit('statusAlert', "can not send your message")
    }
  })

  socket.on('statusAlert', (data) => {
    console.log("alert", data)
  });


  socket.on('disconnect', () => {
    console.log('a user disconnected');
    delUserOut(roomUser[fixChatRoom], socket.id)
    console.log(roomUser)
  });

});

server.listen(8080, () => {
  console.log('server running at http://localhost:8080');
});