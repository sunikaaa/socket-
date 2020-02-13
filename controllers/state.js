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
    // console.log("this is old", this.oldClass.room)
    console.log("this is now", this.room)
    this.oldClass.room = this.room;
    // this.oldClass.roomId = this.roomId;
    return new State(this.room, false, this, this.roomId);
  }

  isChain(room, roomId, flash = undefined) {
    return this.chain ?
      new State(room, this.chaining, this.oldClass, roomId, flash) :
      flash;
  }

  getRoom(roomId = undefined) {
    return roomId ? this.room[roomId] : this.room[this.roomId];
  }

  getRoomId(socketId) {
    return _.filter(this.room, (room) => {
      console.log(room)
    })
  }

  roomIn(socketId, receive) {
    this.room[this.roomId].menber.push({
      name: receive.name,
      id: socketId
    })
    return this.isChain(this.room, this.roomId);
  }



  getWatingPlayer() {
    const wating = _.filter(this.room, randomRoom => randomRoom.random).filter(lengthN(1, "menber"))[0];
    console.log(wating, "filter");
    return wating ? this.isChain(this.room, wating.roomId, wating) : this.isChain(this.room, undefined, wating)
  }

  //return roomId

  //return roomId
  createRoom(socketId, receive = false) {
    if (receive === false) {
      throw Error;
    }
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

  disConnect(socketId) {
    console.log('notfound wating');
    let isInRoom = _.filter(this.room, obj => obj.menber.some(equal(socketId, 'id'))).reduce(roomToObj, {});
    // const disconnectRoom = this.someRoomId(id) ? this.filterRoom(id) : false;
    // disconnectRoom ? this.deleteRoom(disconnectRoom[0].roomId) : false;
    // this.consoleId();
    console.log(isInRoom, isInRoom.roomId);
    return this.isChain(isInRoom)
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
    return this.room.some(equal(roomId, 'roomId'));
  }
}


let state = new State();

exports.state = state;
