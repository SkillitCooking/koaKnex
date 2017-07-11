'use strict';

const config = require('../config');
const fs = require('fs');

module.exports = function (app) {
    if(config.db.client === 'sqlite3') {
        try {
            fs.mkdirSync(config.server.data);
        } catch (err) {
            if(err.code !== 'EEXIST') {
                throw err;
            }
        }
        
        const db = require('knex')(config.db);
        app.db = db;

        let migrationPromise;
        if(!config.env.isTest) {
            //then do migration
            app.migration = true;
            //will only run new, unrun migrations
            migrationPromise = db.migrate.latest()
                .then(() => {
                    app.migration = false;
                }, console.error);
        }

        return async function (ctx, next) {
            if(ctx.app.migration && migrationPromise) {
                await migrationPromise;
            }

            return next();
        }
    }
};