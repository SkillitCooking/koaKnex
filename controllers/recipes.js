'use strict';

const uuid = require('uuid');
const humps = require('humps');
const _ = require('lodash');
const joinJs = require('join-js').default;
const isUUID = require('validator/lib/isUUID');
const Promise = require('bluebird');

const {handleRemoveIdArrs, getUpdateQueries, getRecipeSelectQuery} = require('../lib/queries');
const {PREFIX} = require('../lib/constants');
const relationsMap = require('../relations-map').recipesMap;
const errors = require('../lib/errors');
const {returnWrapper, updateStepsCmpFn} = require('../lib/helpers');

module.exports = {
    async get(ctx) {
        const {body} = ctx.request;
        let {ids = []} = body;
        let query = getRecipeSelectQuery(ctx.app.db('recipes'));
        if(ids.length > 0) {
            query.whereIn('recipes.id', ids);
        }
        let recipes = await query;
        recipes = joinJs.map(recipes, relationsMap, 'recipesMap', PREFIX.RECIPES + '_');
        ctx.body = {data: recipes};
    },

    async post(ctx) {
        const {body} = ctx.request;
        let {recipe = {}} = body;
        let validationOpts = {
            abortEarly: false,
            context: { isUpdate: false }
        };
        recipe = await ctx.app.schemas.recipes.validate(recipe, validationOpts);
        recipe.id = uuid();
        let sanitizedRecipe = _.omit(recipe, ['ingredients', 'seasonings', 'steps', 'tags']);
        await ctx.app.db('recipes').insert(humps.decamelizeKeys(sanitizedRecipe));
        //insert steps and stepTags
        let stepTags = [];
        recipe.steps.forEach((step) => {
            step.id = uuid();
            step.recipe = recipe.id;
            if(step.tags && step.tags.length > 0) {
                stepTags.push(...step.tags.map((tag) => ({
                    id: uuid(),
                    step: step.id,
                    tag: tag
                })));
            }
        });
        let sanitizedSteps = recipe.steps.map((step) => {
            return _.omit(step, ['tags']);
        });
        await ctx.app.db('steps').insert(humps.decamelizeKeys(sanitizedSteps));
        if(stepTags.length > 0) {
            await ctx.app.db('step_tags').insert(stepTags);
        }
        //insert recipeTags
        if(recipe.tags.length > 0) {
            let recipeTags = recipe.tags.map((tag) => ({
                id: uuid(),
                tag: tag,
                recipe: recipe.id
            }));
            await ctx.app.db('recipe_tags').insert(recipeTags);
        }
        //insert recipeIngredients
        recipe.ingredients.forEach(ingred => {
            ingred.id = uuid();
            ingred.recipe = recipe.id;
        });
        await ctx.app.db('recipe_ingredients').insert(humps.decamelizeKeys(recipe.ingredients));
        //insert recipeSeasonings
        if(recipe.seasonings.length > 0) {
            let recipeSeasonings = recipe.seasonings.map((seasoning, index) => ({
                id: uuid(),
                recipe: recipe.id,
                seasoning: seasoning,
                present_order: index + 1
            }));
            await ctx.app.db('recipe_seasonings').insert(recipeSeasonings);
        }
        //select + map
        let retRecipe = await getRecipeSelectQuery(ctx.app.db('recipes'))
            .where('recipes.id', recipe.id);
        retRecipe = joinJs.mapOne(retRecipe, relationsMap, 'recipesMap', PREFIX.RECIPES + '_');
        ctx.body = {data: retRecipe};
    },

    async put(ctx) {
        console.log('here');
        const {body} = ctx.request;
        const {id} = ctx.params;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError('Need an id with that PUT, dawg'));
        }
        let {
            recipe = {},
            stepsToRemove = [],
            stepsToUpdate = [],
            recipeIngredientsToRemove = [],
            recipeIngredientsToUpdate = [],
            seasoningsToRemove = [],
            seasoningsToUpdate = [],
            tagsToRemove = []
        } = body;
        let removeQueries = [];
        let remove = await handleRemoveIdArrs(recipeIngredientsToRemove, ctx, 'recipe_ingredients');
        if(remove) {
            removeQueries.push(remove);
        }
        remove = await handleRemoveIdArrs(seasoningsToRemove, ctx, 'recipe_seasonings');
        if(remove) {
            removeQueries.push(remove);
        }
        remove = await handleRemoveIdArrs(tagsToRemove, ctx, 'recipe_tags');
        if(remove) {
            removeQueries.push(remove);
        }
        if(removeQueries.length > 0) {
            await Promise.all(removeQueries);
        }
        let transaction = await ctx.app.db.transaction(function(trx) {
            let removeQuery = handleRemoveIdArrs(stepsToRemove, ctx, 'steps', trx);
            return removeQuery.then(function(count) {
                let stepQueries = [];
                if(stepsToUpdate.length > 0) {
                    stepsToUpdate.sort(updateStepsCmpFn);
                    stepQueries = stepsToUpdate.map(step => {
                        step = _.omit(step, ['oldOrder', 'tags', 'tagsToRemove']);
                        return trx('steps').where('id', step.id).update(humps.decamelizeKeys(step));
                    });
                    stepsToUpdate.forEach(step => {
                        if(step.tagsToRemove && step.tagsToRemove.length > 0) {
                            stepQueries.push(trx('step_tags').whereIn('id', step.tagsToRemove).del());
                        }
                        if(step.tags && step.tags.length > 0) {
                            let stepTags = step.tags.map(tag => ({
                                id: uuid(),
                                tag: tag,
                                step: step.id
                            }));
                            stepQueries.push(trx('step_tags').insert(stepTags));
                        }
                    });
                }
                return Promise.all(stepQueries)
                    .then(function(results) {
                        if(recipe.steps && recipe.steps.length > 0) {
                            let stepTags = [];
                            recipe.steps.forEach(step => {
                                step.id = uuid();
                                step.recipe = id;
                                if(step.tags && step.tags.length > 0) {
                                    stepTags.push(...step.tags.map(tag => ({
                                        id: uuid(),
                                        step: step.id,
                                        tag: tag
                                    })));
                                }
                            });
                            let sanitizedSteps = recipe.steps.map(step => _.omit(step, ['tags']));
                            return trx('steps').insert(humps.decamelizeKeys(sanitizedSteps))
                                .then(function(res) {
                                    if(stepTags.length > 0) {
                                        return trx('step_tags').insert(stepTags);
                                    } else {
                                        return Promise.resolve(res);
                                    }
                                });
                        }
                        return Promise.resolve(results);
                    });
            });
        });
        if(recipeIngredientsToUpdate.length > 0) {
            try {
                await (() => {
                    return ctx.app.db.transaction(async function(trx) {
                        let updates = await getUpdateQueries(ctx.app.schemas.recipeIngredients, recipeIngredientsToUpdate, trx('recipe_ingredients'));
                        await Promise.all(updates);
                    });
                })();
            } catch (e) {
                ctx.throw(422, e);
            }
        }
        if(seasoningsToUpdate.length > 0) {
            try {
                await (() => {
                    return ctx.app.db.transaction(async function(trx) {
                        let updates = await getUpdateQueries(ctx.app.schemas.recipeSeasonings, seasoningsToUpdate, trx('recipe_seasonings'));
                        let stuff = await Promise.all(updates);
                        console.log(stuff);
                    });
                })();
            } catch (e) {
                ctx.throw(422, e);
            }
        }
        let queries = [];
        if(!_.isEmpty(recipe)) {
            let validationOpts = {
                abortEarly: false,
                context: {isUpdate: true}
            };
            recipe = await ctx.app.schemas.recipes.validate(recipe, validationOpts);
            let updateRecipe = _.omit(recipe, ['ingredients', 'seasonings', 'steps', 'tags']);
            updateRecipe.updatedAt = new Date().toISOString();
            queries.push(ctx.app.db('recipes')
                .where('id', id)
                .update(humps.decamelizeKeys(updateRecipe)));
        }
        if(recipe.ingredients && recipe.ingredients.length > 0) {
            recipe.ingredients.forEach(ingredient => {
                ingredient.id = uuid();
                ingredient.recipe = id;
            });
            queries.push(ctx.app.db('recipe_ingredients').insert(humps.decamelizeKeys(recipe.ingredients)));
        }
        if(recipe.seasonings && recipe.seasonings.length > 0) {
            let recipeSeasonings = recipe.seasonings.map((seasoning) => ({
                id: uuid(),
                recipe: id,
                seasoning: seasoning.id,
                present_order: seasoning.presentOrder
            }));
            queries.push(ctx.app.db('recipe_seasonings').insert(recipeSeasonings));
        }
        if(recipe.tags && recipe.tags.length > 0) {
            let recipeTags = recipe.tags.map(tag => ({
                id: uuid(),
                recipe: id,
                tag: tag
            }));
            queries.push(ctx.app.db('recipe_tags').insert(recipeTags));
        }
        await Promise.all(queries);
        let retRecipe = await getRecipeSelectQuery(ctx.app.db('recipes'))
            .where('recipes.id', id);
        retRecipe = joinJs.mapOne(retRecipe, relationsMap, 'recipesMap', PREFIX.RECIPES + '_');
        ctx.body = {data: retRecipe};
    },

    async del(ctx) {
        const {id} = ctx.params;
        if(!isUUID(id)) {
            ctx.throw(400, new errors.BadRequestError('Need an id with that DELETE, dawg'));
        }
        const data = await ctx.app.db('recipes').where('id', id).returning(['id', 'title']).del();
        ctx.body = {data: humps.camelizeKeys(data)};
    }
};