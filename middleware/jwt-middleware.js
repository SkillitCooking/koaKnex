'use strict';

const jwt = require('koa-jwt');
const {jwtSecret} = require('../config');

module.exports = jwt({
    getToken,
    secret: jwtSecret,
    //so as to handle with downstream middleware
    //based on whether jwt data is set
    passthrough: true,
    key: 'jwtData'
});

function getToken(ctx, opts) {
    const {authorization} = ctx.header;
    console.log('authorization: ', authorization);
    if(authorization && authorization.split(' ')[0] === 'Bearer') {
        return authorization.split(' ')[1];
    }
    if(authorization && authorization.split(' ')[0] === 'Token') {
        return authorization.split(' ')[1];
    }
    return null;
}