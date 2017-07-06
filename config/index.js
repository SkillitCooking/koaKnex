'use strict';

const _ = require('lodash');
const path = require('path');

const knexfile = require('./knexfile');

const ROOT = path.resolve(__dirname, '../');
const NODE_ENV = _.defaultTo(process.env.NODE_ENV, 'development');

const isProd = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';
const isDev = NODE_ENV === 'development';

module.exports = {
    server: {
        port: normalizePort(_.defaultTo(process.env.PORT, 3000)),
        host: _.defaultTo(process.env.HOST, 'localhost'),
        root: ROOT,
        //for your development needs
        data: path.join(ROOT, '../', '/data')
    },

    env: {
        isDev, isTest, isProd
    },

    secret: _.defaultTo(process.env.SECRET, 'secret'),
    jwtSecret: _.defaultTo(process.env.JWT_SECRET, 'secret'),
    jwtOptions: {
        expiresIn: '7d'
    },

    db: knexfile[NODE_ENV]
};

function normalizePort(val) {
    var port = parseInt(val, 10);

    if(isNaN(port)) {
        return val;
    }

    if(port >= 0) {
        return port;
    }

    return false;
}