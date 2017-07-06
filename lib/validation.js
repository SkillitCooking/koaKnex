'use strict';

const _ = require('lodash');

function cannotAuthenticate(user) {
    return !_.isObject(user) || !user.username || !user.password;
}

function validateClient(clientPassword) {
    return clientPassword === process.env.CLIENT_PASSWORD;
}

exports.cannotAuthenticate = cannotAuthenticate;