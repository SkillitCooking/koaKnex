'use strict';
const humps = require('humps');
const uuid = require('uuid');
const isUUID = require('validator/lib/isUUID');
const errors = require('../lib/errors');

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
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError('Yo homes. Use a uuid for that DELETE id'));
        }
        const data = await ctx.app.db('tags').where('id', id).returning(['id', 'name']).del();
        ctx.body = {data: data};
    },

    async put(ctx) {
        const {id} = ctx.params;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError('Yo homes. Use a uuid for that PUT id'));
        }
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