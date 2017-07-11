'use strict';

require('dotenv').config();

//port and host set in config
const {server: {port, host}} = require('../config');

const app = require('../app');

//app.shutDown defined in app.js
process.once('SIGINT', () => app.shutDown());
process.once('SIGTERM', () => app.shutDown());

app.server.listen(port, host);

app.server.on('error', onError);
app.server.on('listening', onListening);

function onError(error) {
    if(error.syscall !== 'listen') {
        throw error;
    }
    //Port normalization in config gives either string for pipe or number for port
    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
        
    // handles specific listen errors
    switch(error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    let addr = app.server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}