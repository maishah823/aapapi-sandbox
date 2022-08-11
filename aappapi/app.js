/**
* AAPP API - Rest and Web Socket Server for AAPP
* Creator: Greg Harkins
* Depends on Node, MongoDb, Redis
*
**/

var express = require('express');
var app = express();


var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
var http = require('http');
http.globalAgent.maxSockets = Infinity;
var server = http.createServer(app);

var RateLimit = require('express-rate-limit');
 
app.enable('trust proxy');
 
var limiter = new RateLimit({
  windowMs:  5*60*1000, // 1 minute
  max: 300, // limit each IP to 500 requests per windowMs
  delayMs: 0, // disable delaying - full speed until the max limit is reached
  message: 'Too many requests. Try again later.'
});
 
//  apply to all requests
app.use(limiter);

require('./services/sockets').listen(server);

var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
var sanitizer = require('express-caja-sanitizer');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var redisSvc = require('./services/redisSvc.js');
mongoose.Promise = require('q').Promise;
mongoose.connect(process.env.MONGODB_URI,{ });
redisSvc.initializeLua();

if (process.env.NODE_ENV == 'development') {
  app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.xml({
  limit: '10MB',
  xmlParseOptions: {
    normalizeTags: true,
    explicitRoot: false,
    explicitArray: false
  }
}));
app.use(function(req,res,next){
  if(req.path === '/blogs'){
    next();
  }else{
    const sanitizerMiddleWear = sanitizer();
    sanitizerMiddleWear(req,res,next);
  }
});

require('./routing/routes')(app);

app.use(function (err, req, res, next) {
  console.error(err);
  res.status(err.status || 500);
});

//If no users exist, setup default user...
require('./services/adminSetup.js');

if(process.env.NODE_ENV === 'development'){
  require('./services/dev');
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
     // logger.error(bind + ' requires elevated privileges');
        console.log(bind + ' requires elevated privileges')
      process.exit(1);
      break;
    case 'EADDRINUSE':
   //   logger.error(bind + ' is already in use');
      console.log(bind + ' is already in use')
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

module.exports = app;
