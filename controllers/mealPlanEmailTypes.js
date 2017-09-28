'use strict';

const {MEAL_PLAN_EMAIL_TYPES} = require('../lib/constants');
const env = require('../config').env;

module.exports = {
    async initialize(ctx) {
        //do upsert of meal plan email types
        let query = ctx.app.db('meal_plan_email_types').insert(Object.keys(MEAL_PLAN_EMAIL_TYPES));
        let safeQuery;
        if(env.dbClient === 'sqlite3') {
            safeQuery = knex.raw('? ON CONFLICT IGNORE', [query]);
        } else {
            //assumes pg
            safeQuery = knex.raw('? ON CONFLICT DO NOTHING', [query]);
        }
        await safeQuery;
        ctx.body = {message: 'Success Everyone!'};
    }
};