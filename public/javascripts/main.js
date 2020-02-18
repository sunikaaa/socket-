const socket = io();
let player = socket.on('post-id', id => id)
socket.on('pare-set', value => {
  console.log(value);
  setTimeout(() => {
    console.log(`this time is ${value}`);
  }, value * 1000);
})
// socket.emit('getNumber',10);
socket.on('room-in', (val) => {
  socket.emit("start-game", val);
  console.log(val, "start")
});
socket.on('opponent-waiting', (val) => console.log(val));
socket.on("opponent-find", (val) => {
  console.log(val)
  socket.emit("start-game", val)
});
socket.on("hello", val => console.log(val))
socket.on('opponent-disconnect', val => console.log(val));

socket.on('random', obj => {
  console.log(obj);
})

// socket.emit('testToServer', "testtesttest");
socket.on("testFromServer", (val) => console.log(val));

socket.on("alredyExist", () => {
  confirm("既にルームに入ってます。退出しますか？") ? socket.emit('room-exit') : '';
})

socket.on("get-error", () => console.log("serverError"));
socket.on("duplicate-error", () => console.log("duplicate"));



new Vue({
  el: '#app',
  data: {
    hello: "hello",
    socket: '',
    name: '',
    room: ''
  },
  methods: {
    submitDice() {},
    roomInRandom() {
      socket.emit('wait-opponent', {
        name: this.name
      });
    },
    roomIn() {
      // if (this.room === '') return;
      // if (this.name === '') return;
      socket.emit('create-room', {
        name: this.name,
        roomId: this.room
      });
      console.log("create");
    },
    findRoom() {
      // if (this.room === '') return;
      // if (this.name === '') return;rad
      socket.emit('enter-room', {
        name: this.name,
        roomId: this.room
      });
    }

  },
})
