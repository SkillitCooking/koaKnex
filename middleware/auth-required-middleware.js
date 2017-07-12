'use strict';

const {UnauthorizedError} = require('../lib/errors');
const {AUTHORIZATION} = require('../lib/constants');
const {has} = require('lodash');

module.exports = function(opts) {
    return async function(ctx, next) {
        let user = ctx.state.user;
        let jwtData = ctx.state.jwtData;
        switch(opts.authorization) {
            case AUTHORIZATION.CLIENT:
                console.log('client', jwtData);
                if(!has(jwtData, 'scopes') || !jwtData.scopes.includes('client')) {
                    ctx.throw(401, new UnauthorizedError());
                }
                break;
            case AUTHORIZATION.PRIVATE:
                console.log('private', jwtData);
                if(!user|| !has(jwtData, 'scopes') || !jwtData.scopes.includes('private')) {
                    ctx.throw(401, new UnauthorizedError());
                }
                break;
            case AUTHORIZATION.PUBLIC:
                console.log('pub', jwtData);
                if(!has(jwtData, 'scopes') || !jwtData.scopes.includes('public')) {
                    ctx.throw(401, new UnauthorizedError());
                }
                break;
            case AUTHORIZATION.LOGGED_IN:
                console.log('log', jwtData);
                if(!user || !has(jwtData, 'scopes') || !jwtData.scopes.includes('logged-in')) {
                    ctx.throw(401, new UnauthorizedError());
                }
                break;
            default:
                break;
        }
        return next();
    };
};