const ArrObj = [{
  roomA: {
    roomId: 'roomA',
    menber: [...Array(100)].fill('menberAs')
  },
  roomB: {
    roomId: 'roomb',
    menber: [...Array(100)].fill('menberBs')
  }
}];

class TestRoom {
  constructor(room, chain = false, oldClass, id = undefined) {
    this.room = room;
    this.chaining = chain;
    this.roomId = id;
    this.oldClass = oldClass;
  }

  chain() {
    return new TestRoom(this.room, true, this);
  }

  save() {
    if (this.chaining === false) {
      console.log("use 'save' with chain");
      return;
    }
    this.oldClass.room = this.room;
    this.oldClass.roomId = this.roomId;
    return new TestRoom(this.room, false, this.roomId);
  }

  createRoom(receive, socketId) {
    let roomId = receive.roomId ? receive.roomId : socketId;
    this.room[roomId] = {
      roomId: roomId,
      mid: socketId,
      menber: [{
        name: receive.name,
        id: socketId
      }]
    };
    console.log(this.oldClass.room, "this is old");
    return this.ischain(this.room, roomId);
  }

  ischain(room, id) {
    return this.chain ?
      new TestRoom(room, this.chaining, this.oldClass, id) :
      room;
  }

  getRoom() {
    return this.room[this.roomId];
  }
}

let State = new TestRoom(ArrObj);
State.save();
// console.log(State.getRoom());
// console.log(
//   State.chain()
//   .createRoom({
//       roomId: '31415gd',
//       name: 'takasi'
//     },
//     'fa43aga'
//   )
//   .save()
// );
// console.log(State.room);


function* numbers() {
  let a = 10;
  const b = yield a;
  console.log(b);
  yield "bb";
}
const gen = numbers();
console.log(gen.next());
console.log(gen.next(1));
