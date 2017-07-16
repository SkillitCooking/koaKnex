'use strict';
const humps = require('humps');
const uuid = require('uuid');

module.exports = {
    async get(ctx) {
        let tags = await ctx.app.db('tags').select('name', 'id');
        ctx.body = {data: tags};
    },
    async post(ctx) {
        const {body} = ctx.request;
        let {tag = {}} = body;

        let validationOpts = {
            abortEarly: false
        };
        tag = await ctx.app.schemas.tags.validate(tag, validationOpts);
        tag.id = uuid();
        await ctx.app.db('tags')
            .insert(humps.decamelizeKeys(tag));
        ctx.body = {data: tag};
    }
}