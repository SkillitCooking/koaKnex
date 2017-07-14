'use strict';

const errors = require('../lib/errors');
const _ = require('lodash');

const http = require('http');

/**
 * What errors are being thrown?
 */

module.exports = error;

function error(opts) {
    opts = opts || {};

    const env = process.env.NODE_ENV || 'development';

    return async function error(ctx, next) {
        try {
            //catch errors in previous middlewares
            await next();
            if(ctx.response.status === 404 && !ctx.response.body) ctx.throw(404);
        } catch (err) {
            //set ctx.status
            console.log('here here here');
            ctx.status = typeof err.status === 'number' ? err.status : 500;
            if(err.errors) {
                err.message += ' ' + err.errors.join('--');
            }
            //emit error signal
            ctx.app.emit('error', err, ctx);

            //send json representation
            //TODO => do something more / parse more wrt err.code later?
            ctx.type = 'application/json';
            //handle db unique errors
            if(errors.isDBError(err)) {
                err.message = errors.getDBErrorMessage(err);
                ctx.status = 422;
            }
            if (env === 'development' || env == 'production') {
                ctx.body = {
                    error: err.message,
                    status: http.STATUS_CODES[ctx.status],
                    stack: err.stack,
                    code: err.code,
                    errno: err.errno,
                    detail: err.detail,
                    err: err
                };
            } else if(err.expose) {
                ctx.body = {
                    error: err.message,
                    status: http.STATUS_CODES[ctx.status],
                    code: err.code
                };
            } else {
                ctx.body = {
                    error: http.STATUS_CODES[ctx.status]
                };
            }
        }
    };
}