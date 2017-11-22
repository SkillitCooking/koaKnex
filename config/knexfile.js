'use strict';

const path = require('path');
const ROOT = path.resolve(__dirname, '../');

const {moduleAvailable} = require('../lib/helpers');
if(moduleAvailable('dotenv')) {
    require('dotenv').config({path: path.join(ROOT, 'bin/.env')});
}

const {DB_CLIENT, DB_CONNECTION} = process.env;

const options = {
    client: DB_CLIENT || 'sqlite3',
    connection: DB_CONNECTION || path.join(ROOT, 'data/dev.sqlite3'),
    migrations: {
        directory: path.join(ROOT, 'migrations'),
        tableName: 'migrations'
    },
    debug: true,
    seeds: {
        directory: path.join(ROOT, 'seeds')
    },
    useNullAsDefault: !DB_CLIENT || DB_CLIENT === 'sqlite3'
};

if (DB_CLIENT && DB_CLIENT !== 'sqlite3') {
    options.pool = {
        min: 2,
        max: 10
    };
}

module.exports = {
    development: Object.assign({}, options),

    test: Object.assign({}, options, {
        connection: DB_CONNECTION || path.join(ROOT, 'data/test.sqlite3')
    }),

    production: Object.assign({}, options, {
        connection: DB_CONNECTION || path.join(ROOT, 'data/prod.sqlite3')
    })
};