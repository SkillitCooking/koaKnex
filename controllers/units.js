'use strict';

const humps = require('humps');
const uuid = require('uuid');

module.exports = {
    async get(ctx) {
        //camelize the below?
        let units = await ctx.app.db('units').select('name_singular', 'name_plural', 'abbreviation', 'id');
        ctx.body = {data: units};
    },

    async post(ctx) {
        //get body
        const {body} = ctx.request;
        let {units = {}} = body;
        //validate
        const validationOptions = {
            abortEarly: false
        };
        units = await ctx.app.schemas.units.validate(units, validationOptions);
        units.id = uuid();
        await ctx.app.db('units')
            .insert(humps.decamelizeKeys(units));
        ctx.body = {data: units};
    }
}