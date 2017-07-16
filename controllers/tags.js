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
            abortEarly: false,
            context: { isUpdate: false }
        };
        tag = await ctx.app.schemas.tags.validate(tag, validationOpts);
        tag.id = uuid();
        await ctx.app.db('tags')
            .insert(humps.decamelizeKeys(tag));
        ctx.body = {data: tag};
    },

    //unresolved question: should ingredients be deleted on category deletion?
    async del(ctx) {
        const {id} = ctx.params;
        const data = await ctx.app.db('tags').where('id', id).returning(['id', 'name']).del();
        ctx.body = {data: data};
    },

    async put(ctx) {
        const {id} = ctx.params;
        const {body} = ctx.request;
        let {tag = {}} = body;
        //validate
        const validationOpts = {
            abortEarly: false,
            context: { isUpdate: true }
        };
        tag = await ctx.app.schemas.tags.validate(tag, validationOpts);
        tag.updatedAt = new Date().toISOString();
        const data = await ctx.app.db('tags').where('id', id).returning('*').update(humps.decamelizeKeys(tag));
        ctx.body = {data: data};
    }
};