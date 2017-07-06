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
                if(!has(jwtData, 'scopes') || !jwtData.scopes.includes('client')) {
                    ctx.throw(401, new UnauthorizedError());
                }
            case AUTHORIZATION.PRIVATE:
                if(!user|| !has(jwtData, 'scopes') || !jwtData.scopes.includes('private')) {
                    ctx.throw(401, new UnauthorizedError());
                }
            case AUTHORIZATION.PUBLIC:
                if(!has(jwtData, 'scopes') || !jwtData.scopes.includes('public')) {
                    ctx.throw(401, new UnauthorizedError());
                }
            case AUTHORIZATION.LOGGED_IN:
                if(!user || !has(jwtData, 'scopes') || !jwtData.scopes.includes('logged-in')) {
                    ctx.throw(401, new UnauthorizedError());
                }
            default:
                break;
        }
        return next();
    };
};