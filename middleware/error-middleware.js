'use strict';

const errors = require('../lib/errors');
const _ = require('lodash');

const http = require('http');

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
            
        }
    };
}