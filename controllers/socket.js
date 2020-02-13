const _  = require('lodash');
// import State from './state';
const SocketController = require('./socketController.js');
const Socket = require('./socketController.js').Socket;
const GameStart = require('./socketController.js').Game;


const createPare = SocketController.createPare();
const createRandom = () => Math.floor(Math.random() * 5 + 5);
const StickSendVal = (fn,obj) => obj.val = fn()
const emitRandom = _.partial(StickSendVal,createRandom);
const isMid = (socketid,obj) => socketid === obj.mid;
const roomMasterEmit = obj => (socket,io,fireName,fn)=>{
  if(socket.id === obj.mid){
    io.to(obj.roomId).emit(fireName,fn(obj))
  }
}


exports.socketConnect = (io,State) => socket => {

    const emitMaster = (val)=>{
        new GameStart(socket,io).emitRoom('random',emitRandom(val),val.roomId);
      }
  SOCKET = new Socket(socket,io);
  Game = new GameStart(socket,io);
  console.log(SOCKET.id(),"確認");
  //roomObj {
    //  name:'name',
    //  roomId: 'roomId'
    SOCKET.on('create-room',createPare(SOCKET,State).createRoom)
    SOCKET.on('enter-room',createPare(SOCKET,State).enterRoom)

    SOCKET.on('wait-opponent',createPare(SOCKET,State).waitPare)

    SOCKET.disConnect(createPare(SOCKET,State).disConnect);

    SOCKET.on('start-game');
new Socket(socket,io).on('start-game',(val)=>{
  isMid(socket.id,val) ? emitMaster(val) : '';
})





  SOCKET.on('testToServer',(val)=>{
    SOCKET.emit('testFromServer',{uid:SOCKET.id(),data:val});
  })
}
