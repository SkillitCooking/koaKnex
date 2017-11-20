'use strict';

module.exports = function() {
    return async function(ctx, next) {
        let start = Date.now();
        await next();
        let delta = Math.ceil(Date.now() - start);
        ctx.set('X-Response-Time', delta + 'ms');
    };
};