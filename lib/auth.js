'use strict';

const {jwtSecret, jwtOptions} = require('../config');
const jwt = require('jsonwebtoken');
const humps = require('humps');
const _ = require('lodash');
const env = require('../config').env;

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
    user = humps.camelizeKeys(user);
    if(env.dbClient === 'sqlite3') {
        //convert isAdmin to boolean
        if(user.isAdmin === true || user.isAdmin === 1) {
            user.isAdmin = true;
        } else {
            user.isAdmin = false;
        }
    }
    return Object.assign({}, user, {
        token: jwt.sign({
            sub: _.pick(user, ['id', 'email', 'username', 'isAdmin']),
            scopes: scopes
        }, jwtSecret, jwtOptions)
    });
}

exports.generateJWTForUser = generateJWTForUser;