'use strict';

const Redis = require('ioredis');
const ratelimit = require('koa-ratelimit');

module.exports = ratelimit({
    db: new Redis(),
    errorMessage: 'You have hit the request rate limit, bro!',
    id: (ctx) => ctx.ip,
    headers:{
        remaining: 'Rate-Limit-Remaining',
        reset: 'Rate-Limit-Reset',
        total: 'Rate-Limit-Total'
    }
});
