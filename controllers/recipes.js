'use strict';

const uuid = require('uuid');
const humps = require('humps');
const _ = require('lodash');
const joinJs = require('join-js').default;
const isUUID = require('validator/lib/isUUID');
const Promise = require('bluebird');

const {getSelectQueries, recipesFetchFields} = require('../lib/queries');
const {PREFIX} = require('../lib/constants');
const relationsMap = require('../relations-map').recipesMap;
const errors = require('../lib/errors');
const {isUUIDArray, makeSchemaArray} = require('../lib/validation');
const {returnWrapper, updateStepsCmpFn} = require('../lib/helpers');

async function handleRemoveIdArrs(arr, ctx, dbName, db) {
    db = db ? db : ctx.app.db;
    if(arr.length > 0) {
        let isValid = await isUUIDArray(arr);
        if(!isValid) {
            ctx.throw(422, new errors.ValidationError(dbName + 'ToRemove not UUID array'));
        }
        return db(dbName).whereIn('id', arr).del();
    }
    return false;
}

async function getUpdateQueries(schema, objArr, db) {
    let arrSchema = makeSchemaArray(schema);
    let validationOpts = {
        abortEarly: false,
        context: {isUpdate: true}
    };
    objArr = await arrSchema.validate(objArr, validationOpts);
    objArr.forEach(elem => elem.updatedAt = new Date().toISOString());
    return objArr.map(elem => {
        return db.where('id', elem.id).update(humps.decamelizeKeys(elem));
    });
}

function getRecipeSelectQuery(db) {
    return db
        .leftJoin('steps', 'recipes.id', 'steps.recipe')
        .leftJoin('step_tags', 'steps.id', 'step_tags.step')
        .leftJoin('recipe_ingredients', 'recipes.id', 'recipe_ingredients.recipe')
        .leftJoin('ingredients', 'recipe_ingredients.ingredient', 'ingredients.id')
        .leftJoin('ingredient_tags', 'ingredients.id', 'ingredient_tags.ingredient')
        .leftJoin('units', 'ingredients.units', 'units.id')
        .leftJoin('recipe_seasonings', 'recipes.id', 'recipe_seasonings.recipe')
        .leftJoin('seasonings', 'recipe_seasonings.seasoning', 'seasonings.id')
        .leftJoin('recipe_tags', 'recipes.id', 'recipe_tags.recipe')
        .leftJoin('tags as r_tags', 'r_tags.id', 'recipe_tags.tag')
        .leftJoin('tags as s_tags', 's_tags.id', 'step_tags.tag')
        .leftJoin('tags as i_tags', 'i_tags.id', 'ingredient_tags.tag')
        .select(...getSelectQueries('recipes', PREFIX.RECIPES, recipesFetchFields.recipes),
            ...getSelectQueries('steps', PREFIX.STEPS, recipesFetchFields.steps),
            ...getSelectQueries('step_tags', PREFIX.STEP_TAGS, recipesFetchFields.stepTags),
            ...getSelectQueries('recipe_ingredients', PREFIX.RECIPE_INGREDIENTS, recipesFetchFields.recipeIngredients),
            ...getSelectQueries('ingredients', PREFIX.INGREDIENTS, recipesFetchFields.ingredients),
            ...getSelectQueries('units', PREFIX.UNITS, recipesFetchFields.units),
            ...getSelectQueries('ingredient_tags', PREFIX.INGREDIENT_TAGS, recipesFetchFields.ingredientTags),
            ...getSelectQueries('seasonings', PREFIX.SEASONINGS, recipesFetchFields.seasonings),
            ...getSelectQueries('recipe_seasonings', PREFIX.RECIPE_SEASONINGS, recipesFetchFields.recipeSeasonings),
            ...getSelectQueries('recipe_tags', PREFIX.RECIPE_TAGS, recipesFetchFields.recipeTags),
            ...getSelectQueries('r_tags', PREFIX.R_TAGS, recipesFetchFields.tags),
            ...getSelectQueries('s_tags', PREFIX.S_TAGS, recipesFetchFields.tags),
            ...getSelectQueries('i_tags', PREFIX.I_TAGS, recipesFetchFields.tags));
}

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
            let recipeSeasonings = recipe.seasonings.map((seasoning) => ({
                id: uuid(),
                recipe: recipe.id,
                seasoning: seasoning
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
            tagsToRemove = []
        } = body;
        let removeQueries = [];
        let remove = await handleRemoveIdArrs(recipeIngredientsToRemove, ctx, 'recipe_ingredients')
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
                console.log('count', count);
                let stepQueries = [];
                if(stepsToUpdate.length > 0) {
                    stepsToUpdate.sort(updateStepsCmpFn);
                    stepQueries = stepsToUpdate.map(step => {
                        console.log('step', step);
                        step = _.omit(step, ['oldOrder', 'tags', 'tagsToRemove']);
                        return trx('steps').where('id', step.id).update(humps.decamelizeKeys(step));
                    });
                    stepsToUpdate.forEach(step => {
                        if(step.tagsToRemove && step.tagsToRemove.length > 0) {
                            console.log('tagsToRemove', step.tagsToRemove);
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
                    console.log('stepQueries', results);
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
                        console.log('sanitizedSteps', sanitizedSteps);
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
        console.log('transaction', transaction);
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
        let queries = [];
        if(!_.isEmpty(recipe)) {
            let validationOpts = {
                abortEarly: false,
                context: {isUpdate: true}
            };
            recipe = await ctx.app.schemas.recipes.validate(recipe, validationOpts);
            console.log('here');
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
                seasoning: seasoning
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
        ctx.body = {data: data};
    }
};