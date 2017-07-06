'use strict';

const humps = require('humps');
const _ = require('lodash');


//event bubbling vs. event capturing. or vice versa
module.exports = async function(ctx, next) {
    await next();
    if(ctx.body && _.isObjectLike(ctx.body)) {
        ctx.body = humps.camelizeKeys(ctx.body);
    }
};