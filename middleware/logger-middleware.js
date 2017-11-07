'use strict';

const path = require('path');
const winston = require('winston');
const ROOT = path.resolve(__dirname, '../');
const bytes = require('bytes');

let logToFile = process.env.LOG_TO_FILE === 'true' ? true : false;
const env = process.env.NODE_ENV || 'development';

if(logToFile) {
    winston.configure({
        transports: [
            new (winston.transports.File)({
                name: 'info-file',
                level: 'info',
                filename: path.join(ROOT, '/logs/calls.log'),
                maxsize: 1024 * 100,
                maxFiles: 3,
                timestamp: true
            }),
            new (winston.transports.File)({
                name: 'error-file',
                level: 'error',
                filename: path.join(ROOT, '/logs/errors.log'),
                maxsize: 1024 * 100,
                maxFiles: 5,
                timestamp: true
            })
        ]
    });
} else {
    winston.configure({
        transports: [new (winston.transports.Console)({timestamp: true})]
    });
}

module.exports = logger;

function logger(opts) {
    opts = opts || {};
    let app = opts.app;

    app.on('error', (err, ctx) => {
        //file log err.[stack, message, name]
        if(env === 'development') {
            winston.error('ERROR: %s \n %s', err.message, err.stack);
        } else {
            winston.error('ERROR: ', err);
        }
    });

    return async function logger(ctx, next) {
        let requestSize = ctx.request.length;
        if(!requestSize) {
            requestSize = 0;
        }
        winston.info('START %s %s %s', ctx.request.method, ctx.request.path, bytes(requestSize));
        let start = Date.now();
        await next();
        let delta = Math.ceil(Date.now() - start);
        let responseSize = ctx.response.length;
        if(!responseSize){
            responseSize = 0;
        }
        winston.info('END %s %s %s %s %s', ctx.method, ctx.path, ctx.status, delta + 'ms', bytes(responseSize));
    }
}