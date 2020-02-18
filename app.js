var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const ip = require('ip');
// var logger = require('morgan');

var app = express();

const server = require('http').createServer(app);
const PORT = process.env.PORT || 5000;
const io = require('socket.io')(server);
const _ = require('lodash');
const State = require('./controllers/state.js').state;
const socketFanc = require('./controllers/socket');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(logger('dev'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
app.use('/vue', express.static(__dirname + '/node_modules/vue/dist'));
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// io.on('connection', socketFanc.socketConnect(io, State));

io.sockets.on('connection', socketFanc.socketConnect(io));
var os = require('os');

server.listen(PORT, () => {
  console.log(`My Server URL : http://${ip.address()}/`);
  console.log(`My Server URL : http://${ip.address()}:${PORT}/`);
  ('use strict');

  var ifaces = os.networkInterfaces();
  var ipAddress;

  Object.keys(ifaces).forEach(function (ifname) {
    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      console.log(ifname, iface.address);
      // en0 192.168.1.NNN
      ipAddress = iface.address;
    });
  });
});
