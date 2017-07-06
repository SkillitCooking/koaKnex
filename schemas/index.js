'use strict';

const users = require('./users');

module.exports = function(app) {
    app.schemas = {
        users
    };
};