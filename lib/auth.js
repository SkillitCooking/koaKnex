'use strict';

const {jwtSecret, jwtOptions} = require('../config');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

function getScopes(user) {
    if(user.isAdmin) {
        return ['private', 'client', 'logged-in', 'public'];
    }
    if(user.id) {
        return ['client', 'public', 'logged-in'];
    }
    if(user.isClient) {
        return ['client', 'public'];
    }
    return ['public'];
}

function generateJWTForUser(user = {}) {
    let scopes = getScopes(user);
    return Object.assign({}, user, {
        token: jwt.sign({
            sub: _.pick(user, ['id', 'email', 'username', 'isAdmin']),
            scopes: scopes
        }, jwtSecret, jwtOptions)
    });
}

exports.generateJWTForUser = generateJWTForUser;