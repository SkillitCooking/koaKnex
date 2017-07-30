'use strict';
const humps = require('humps');
const uuid = require('uuid');
const _ = require('lodash');

const joinJs = require('join-js').default;
const isUUID = require('validator/lib/isUUID');

const {getSelectQueries, seasoningsFetchFields} = require('../lib/queries');
const {PREFIX, MAP_IDS} = require('../lib/constants');
const relationsMap = require('../relations-map').seasoningsMap;
const errors = require('../lib/errors');

module.exports = {
    async get(ctx) {
        const {body} = ctx.request;
        let {ids = []} = body;
        let query = ctx.app.db('seasonings')
            .leftJoin('composing_seasonings', 'seasonings.id', 'composing_seasonings.parent')
            .leftJoin('seasonings as child_seasonings', 'composing_seasonings.child', 'child_seasonings.id')
            .select(...getSelectQueries('seasonings', PREFIX.SEASONINGS, seasoningsFetchFields.seasonings),
                ...getSelectQueries('composing_seasonings', PREFIX.COMPOSING_SEASONINGS, seasoningsFetchFields.composingSeasonings),
                ...getSelectQueries('child_seasonings', PREFIX.CHILD_SEASONINGS, seasoningsFetchFields.childSeasonings));
        if(ids.length > 0) {
            query.whereIn('seasonings.id', ids);
        }
        let seasonings = await query;
        seasonings = joinJs.map(seasonings, relationsMap, MAP_IDS.SEASONINGS, PREFIX.SEASONINGS + '_');
        ctx.body = {data: seasonings};
    },

    async post(ctx) {
        const {body} = ctx.request;
        let {seasoning = {}} = body;
        let validationOpts = {
            abortEarly: false,
            context: { isUpdate: false }
        };
        seasoning = await ctx.app.schemas.seasonings.validate(seasoning, validationOpts);
        seasoning.id = uuid();
        let sanitizedSeasoning = _.omit(seasoning, ['composingSeasonings'])
        await ctx.app.db('seasonings').insert(humps.decamelizeKeys(sanitizedSeasoning));
        if(seasoning.isComposite) {
            //add composites
            let composingSeasonings = seasoning.composingSeasonings.map(comp => ({
                id: uuid(),
                parent: seasoning.id,
                child: comp
            }));
            await ctx.app.db('composing_seasonings').insert(humps.decamelizeKeys(composingSeasonings));
        }
        let retSeasoning = await ctx.app.db('seasonings')
            .leftJoin('composing_seasonings', 'seasonings.id', 'composing_seasonings.parent')
            .leftJoin('seasonings as child_seasonings', 'composing_seasonings.child', 'child_seasonings.id')
            .select(...getSelectQueries('seasonings', PREFIX.SEASONINGS, seasoningsFetchFields.seasonings),
                ...getSelectQueries('composing_seasonings', PREFIX.COMPOSING_SEASONINGS, seasoningsFetchFields.composingSeasonings),
                ...getSelectQueries('child_seasonings', PREFIX.CHILD_SEASONINGS, seasoningsFetchFields.childSeasonings))
            .where('seasonings.id', seasoning.id);
        retSeasoning = joinJs.mapOne(retSeasoning, relationsMap, MAP_IDS.SEASONINGS, PREFIX.SEASONINGS + '_');
        ctx.body = {data: retSeasoning};
    },

    async put(ctx) {
        const {id} = ctx.params;
        const {body} = ctx.request;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError('YO man. Use a uuid for that DELETE id'));
        }
        let {seasoning = {}, removeCompSeasonings = []} = body;
        if(seasoning.composingSeasonings && seasoning.composingSeasonings.length > 0) {
            let newRelations = seasoning.composingSeasonings.map(comp => ({
                id: uuid(),
                parent: id,
                child: comp
            }));
            await ctx.app.db('composing_seasonings').insert(newRelations);
        }
        if(!_.isEmpty(seasoning)) {
            const validationOpts = {
                abortEarly: false,
                context: { isUpdate: true }
            };
            seasoning = await ctx.app.schemas.seasonings.validate(seasoning, validationOpts);
            let updateSeasoning = _.omit(seasoning, ['composingSeasonings']);
            updateSeasoning.updatedAt = new Date().toISOString();
            await ctx.app.db('seasonings').where('id', id)
                .update(humps.decamelizeKeys(updateSeasoning));
        }
        if(removeCompSeasonings.length > 0) {
            await ctx.app.db('composing_seasonings').whereIn('id', removeCompSeasonings).del();
        }
        let retSeasoning = await ctx.app.db('seasonings')
            .leftJoin('composing_seasonings', 'seasonings.id', 'composing_seasonings.parent')
            .leftJoin('seasonings as child_seasonings', 'composing_seasonings.child', 'child_seasonings.id')
            .select(...getSelectQueries('seasonings', PREFIX.SEASONINGS, seasoningsFetchFields.seasonings),
                ...getSelectQueries('composing_seasonings', PREFIX.COMPOSING_SEASONINGS, seasoningsFetchFields.composingSeasonings),
                ...getSelectQueries('child_seasonings', PREFIX.CHILD_SEASONINGS, seasoningsFetchFields.childSeasonings))
            .where('seasonings.id', id);
        retSeasoning = joinJs.mapOne(retSeasoning, relationsMap, MAP_IDS.SEASONINGS, PREFIX.SEASONINGS + '_');
        ctx.body = {data: retSeasoning};
    },

    async del(ctx) {
        const {id} = ctx.params;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError('YO homes. Use a uuid for that DELETE id'));
        }
        const data = await ctx.app.db('seasonings').where('id', id).returning(['id', 'name']).del();
        ctx.body = {data: data};
    }
};