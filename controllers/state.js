const _ = require('lodash');

const equal = (preval, objKey = undefined) => cuval => {
  if (objKey === undefined) {
    return preval === cuval;
  }
  return preval === cuval[objKey];
};

const lengthN = (length, objKey = undefined) => val => {
  if (objKey === undefined) {
    val.length === length;
  }
  return length === val[objKey].length;
};
const roomToObj = (obj, data) => ({
  ...obj,
  [data.id]: data
})

// {
//     roomId:roomId,
//     mid:id,
//     menber:[{
//         name:name,
//         id:id
//     }]
// }

class State {
  constructor(room = {}, chain = false, oldClass, roomId = undefined, flash = undefined) {
    this.room = room;
    this.chaining = chain;
    this.roomId = roomId;
    this.oldClass = oldClass;
    this.flash = flash
  }

  chain() {
    return new State(_.cloneDeep(this.room), true, this);
  }

  save() {
    if (this.chaining === false) {
      console.log('use "save" with chain');
      return;
    }
    // console.log("this is now", this.room)
    this.oldClass.room = this.room;
    // return new State(this.room, false, this, this.roomId, this.flash);
    return this.isChain(this.room, this.roomId, this.flash);
  }




  isChain(room, roomId, flash = undefined) {
    if (typeof flash === Object || typeof flash === Array) {
      flash = _.cloneDeep(flash);
    }
    return this.chaining ?
      new State(room, this.chaining, this.oldClass, roomId, flash) :
      flash;
  }

  isDuplicatePlayer(socketId) {
    let isDupricate = _.some(this.room, theRoom => {
      // console.log(theRoom.menber, "some", socketId);
      return theRoom.menber.some(equal(socketId, 'id'))
    })
    console.log(isDupricate, "isDuplicate", socketId);


    return this.isChain(this.room, undefined, isDupricate)
  }


  getRoom(roomId = undefined) {
    return this.isChain(this.room, this.roomId, roomId ? _.cloneDeep(this.room[roomId]) : _.cloneDeep(this.room[this.roomId]));
  }

  getRoomFn(fn, roomId) {
    return roomId ? fn(this.room[roomId]) : fn(this.room[this.roomId]);
  }

  then(fn) {
    return this.isChain(this.room, this.roomId, fn(this.flash));
  }

  getRoomId(socketId) {
    if (this.roomId === undefined) {
      let id = socketId || this.flash
      const theRoom = _.find(this.room, (room) => {
        return room.menber.some(equal(id, 'id'));
      }) || {}
      return this.isChain(this.room, theRoom.roomId, theRoom.roomId);
    }
    return this.roomId;
  }

  roomIn(socketId, receive) {
    this.room[this.roomId].menber.push({
      name: receive.name,
      id: socketId
    })
    return this.isChain(this.room, this.roomId);
  }

  isFullRoom(roomId) {
    return this.room[roomId].menber.length > 1;
  }

  getWatingPlayer(receive) {
    if (typeof receive == "object") {
      if (receive.roomId !== undefined) {
        return this.isChain(this.room, receive.roomId)
      }
    }
    let wating = _.filter(this.room, randomRoom => randomRoom.random).filter(lengthN(1, "menber"))[0] || {};
    return this.isChain(this.room, wating.roomId, wating)
  }


  //return roomId
  createRoom(socketId, receive = false) {

    let roomId = receive.roomId ? receive.roomId : socketId + Date.now();
    this.room[roomId] = {
      roomId: roomId,
      mid: socketId,
      random: receive.roomId ? false : true,
      menber: [{
        name: receive.name,
        id: socketId
      }]
    };
    return this.isChain(this.room, roomId)
  }

  getFlash() {
    return this.flash;
  }


  delPlayer(id) {
    let stateObj = {
      room: this.room,
      watingPlayer: this.watingPlayer
    };
    for (obj in stateObj) {
      let NewObj = stateObj[obj].filter(val => val.id !== id);
      this[obj] = NewObj[obj];
    }
  }

  createSendObj(socketId, roomId, name = '名無し') {
    let obj = {
      uid: socketId,
      roomId: roomId,
      name: name
    };
    return obj;
  }

  disConnect() {
    console.log('notfound wating');
    delete this.room[this.roomId];
    return this.isChain(this.room, this.roomId, this.roomId);
  }

  deleteRoom(id) {
    this.room = this.room.filter(val => {
      val.roomId !== id;
    });
  }

  filterRoom(id) {
    return this.room.filter(val => {
      return val.menber.some(menber => {
        return menber.id === id;
      });
    });
  }

  consoleId() {
    [this.room, this.watingPlayer].forEach(val =>
      console.log(val, 'consoleid')
    );
  }

  filterId(id, val) {
    this[val] = this[val].filter(value => value.id !== id);
  }

  getRoomObj(roomId) {
    return this.room.filter(val => {
      return val.roomId === roomId;
    });
  }

  someId(id, val) {
    return this[val].some(equal(id, 'id'));
  }

  someRoomId(id) {
    const bool = this.room.some(value => {
      console.log(value.menber, id, 'roomcheck');
      return value.menber.some(equal(id, 'id'));
    });
    return bool;
  }

  shiftWaitingRoomObj() {
    return this.watingPlayer.shift();
  }

  isExistRoom(roomId) {
    return _.some(this.room, equal(roomId, 'roomId'));
  }
}


let state = new State();

exports.state = state;
