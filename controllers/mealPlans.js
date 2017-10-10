'use strict';

const humps = require('humps');
const uuid = require('uuid');
const _ = require('lodash');
const joinJs = require('join-js').default;
const isUUID = require('validator/lib/isUUID');

const relationsMap = require('../relations-map').mealPlansMap;
const errors = require('../lib/errors');
const {MEAL_PLAN_EMAIL_TYPES, PREFIX} = require('../lib/constants');
const {getMealPlanSelectQuery} = require('../lib/queries');

module.exports = {
    async post(ctx) {
        //get input from body + validate
        const {body} = ctx.request;
        let {mealPlan = {}} = body;
        const validationOpts = {
            abortEarly: false,
            context: {isUpdate: false}
        };
        mealPlan = await ctx.app.schemas.mealPlans.validate(mealPlan, validationOpts);
        mealPlan.id = uuid();
        //create mealPlan, omitting recipes
        let sanitizedMealPlan = _.omit(mealPlan, ['recipes']);
        await ctx.app.db('meal_plans')
            .insert(humps.decamelizeKeys(sanitizedMealPlan));
        //create recipe mealPlans
        let recipeMealPlans = mealPlan.recipes.map(recipeId => ({
            id: uuid(),
            recipe: recipeId,
            mealPlan: mealPlan.id
        }));
        await ctx.app.db('recipe_meal_plans').insert(humps.decamelizeKeys(recipeMealPlans));
        //create mealPlanEmail
        let mealPlanEmail = {
            id: uuid(),
            mealPlan: mealPlan.id,
            emailType: MEAL_PLAN_EMAIL_TYPES.DELIVERY_EMAIL
        };
        await ctx.app.db('meal_plan_emails').insert(humps.decamelizeKeys(mealPlanEmail));
        //return mealPlan
        let retMealPlan = await getMealPlanSelectQuery(ctx.app.db('meal_plans')).whereIn('meal_plans.id', [mealPlan.id]);
        retMealPlan = joinJs.mapOne(retMealPlan, relationsMap, 'mealPlanMap', PREFIX.MEAL_PLANS + '_');
        ctx.body = {data: retMealPlan};
    },

    async get(ctx) {
        let query = getMealPlanSelectQuery(ctx.app.db('meal_plans'));
        let mealPlans = await query;
        mealPlans = joinJs.map(mealPlans, relationsMap, 'mealPlanMap', PREFIX.MEAL_PLANS  + '_');
        ctx.body = {data: mealPlans};
    },

    async getOne(ctx) {
        //get id and validate
        const {id} = ctx.params;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError('Need an id to get in the GET/:id club, dood'));
        }
        //fetch, map, return
        let query = getMealPlanSelectQuery(ctx.app.db('meal_plans')).whereIn('meal_plans.id', [id]);
        let mealPlan = await query;
        mealPlan = joinJs.mapOne(mealPlan, relationsMap, 'mealPlanMap', PREFIX.MEAL_PLANS + '_');
        ctx.body = {data: mealPlan};
    },

    async mealPlansForUser(ctx) {
        //get id and validate
        const {id} = ctx.params;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError('Need an id to get in the GET/:id club, brah'));
        }
        //fetch meal plans with user, map, and return
        let query = getMealPlanSelectQuery(ctx.app.db('meal_plans')).where('user', id);
        let mealPlans = await query;
        mealPlans = joinJs.map(mealPlans, relationsMap, 'mealPlanMap', PREFIX.MEAL_PLANS + '_');
        ctx.body = {data: mealPlans};
    },

    async put(ctx) {
        //get input from body and validate
        const {body} = ctx.request;
        const {id} = ctx.params;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError('Dude, PUTs require an id'));
        }
        let {
            mealPlan = {},
            recipesToRemove = []
        } = body;
        let queries = [];
        if(!_.isEmpty(mealPlan)) {
            let validationOpts = {
                abortEarly: false,
                context: {isUpdate: true}
            }
            mealPlan = await ctx.app.schemas.mealPlans.validate(mealPlan, validationOpts);
            let updateMealPlan = _.omit(mealPlan, ['recipes']);
            updateMealPlan.updatedAt = new Date().toISOString();
            queries.push(ctx.app.db('meal_plans')
                .where('id', id)
                .update(humps.decamelizeKeys(updateMealPlan)));
            if(mealPlan.recipes && mealPlan.recipes.length > 0) {
                let recipeMealPlans = mealPlan.recipes.map(recipeId => ({
                    id: uuid(),
                    recipe: recipeId,
                    meal_plan: id
                }));
                queries.push(ctx.app.db('recipe_meal_plans').insert(recipeMealPlans));
            }
        }
        if(recipesToRemove.length > 0) {
            queries.push(ctx.app.db('recipe_meal_plans').whereIn('id', recipesToRemove).del());
        }
        await Promise.all(queries);
        //fetch, map, return mealPlan
        let retMealPlan = await getMealPlanSelectQuery(ctx.app.db('meal_plans')).whereIn('meal_plans.id', [id]);
        retMealPlan = joinJs.mapOne(retMealPlan, relationsMap, 'mealPlanMap', PREFIX.MEAL_PLANS + '_');
        ctx.body = {data: retMealPlan};
    },

    async del(ctx) {
        //validate id
        const {id} = ctx.params;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError('Dude, DELETE-ing requires an id'));
        }
        const data = await ctx.app.db('meal_plans').where('id', id).returning(['id', 'title']).del();
        ctx.body = {data: humps.camelizeKeys(data)};
        //delete, return
    }
};