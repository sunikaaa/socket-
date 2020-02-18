const _ = require('lodash');
const State = require('./state').state;

const {
  Either,
  Right,
  Left,
  Maybe,
  IO
} = require('./monads.js');



const createRandom = () => Math.floor(Math.random() * 5 + 5);
const isMid = (socketid, obj) => socketid === obj.mid;


const waitPare = (val) => {
  return _.isEmpty(State.getWatingPlayer()) ? Either.left(val) : Either.right(val)
}


exports.socketConnect = (io) => socket => {
  const roomEmit = _.curry((socketId, obj) => {
    return io.to(obj.roomId).emit('opponent-disconnect', socketId);
  })
  const errorExist = (errorName, socketId) => {
    io.to(socketId).emit(errorName);
    return Maybe.nothing();
  }
  const emitMastar = (socketId, fireName, req, res) => {
    if (isMid(socketId, req)) {
      io.to(req.roomId).emit(fireName, req.val = res);
    }
  }
  const isExistRoom = _.curry((socketId, req) => {
    return State.isExistRoom(req.roomId) ? errorExist('room-isExist', socketId) : Maybe.just(req)
  })
  const isNotExistRoom = _.curry((socketId, req) => {
    return !State.isExistRoom(req.roomId) ? errorExist('room-isnotExist', socketId) : Maybe.just(req);
  })
  const isFullMenber = _.curry((socketId, req) => {
    return State.isFullRoom(req.roomId) ? errorExist('room-isFull', socketId) : Maybe.just(req);
  })

  const safeIsDuplicate = _.curry((socketId, req) => {
    return State.isDuplicatePlayer(socketId) ? errorExist('duplicate-error', socketId) : Maybe.just(req);
  });


  const socketJoin = _.curry((fireName, room) => {
    return socket.join(room.roomId, () => {
      io.to(room.roomId).emit(fireName, room);
    })
  })
  const createRoom = _.curry((socketid, req) => {
    State.chain()
      .createRoom(socketid, req)
      .save()
      .getRoom()
      .then(socketJoin('opponent-wating'));
  })
  const joinRoom = _.curry((socketid, req) => {
    State.chain()
      .getWatingPlayer(req)
      .roomIn(socketid, req)
      .save()
      .getRoom()
      .then(socketJoin('opponent-find'));
  })
  const stateDisconnect = socketId => {
    return State.chain()
      .getRoomId(socketId)
      .disConnect()
      .save()
      .getRoom()
  }

  socket.on('disconnect', () => {
    Maybe.fromNullable(stateDisconnect(socket.id))
      .map(roomEmit(socket.id))
  })


  socket.on('create-room', val => {
    Maybe.fromNullable(val)
      .chain(safeIsDuplicate(socket.id))
      .chain(isExistRoom(socket.id))
      .chain(createRoom(socket.id))
  });
  socket.on('enter-room', val => {
    Maybe.fromNullable(val)
      .chain(safeIsDuplicate(socket.id))
      .chain(isNotExistRoom(socket.id))
      .chain(isFullMenber(socket.id))
      .chain(joinRoom(socket.id))
  })

  socket.on('wait-opponent', req => {
    Maybe.fromNullable(req)
      .chain(safeIsDuplicate(socket.id))
      .chain(waitPare)
      .map(joinRoom(socket.id))
      .orElse(createRoom(socket.id))
  })

  socket.on('start-game', room => {
    emitMastar(socket.id, 'random', room, createRandom());
  })

  socket.on('testToServer', (val) => {
    socket.emit('testFromServer', {
      uid: socket.id,
      data: val
    });
  })
}
