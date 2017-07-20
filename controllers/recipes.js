'use strict';

const uuid = require('uuid');
const humps = require('humps');
const _ = require('lodash');
const joinJs = require('join-js').default;
const isUUID = require('validator/lib/isUUID');

const {getSelectQueries, recipesFetchFields} = require('../lib/queries');
const {PREFIX} = require('../lib/constants');
const relationsMap = require('../relations-map').recipesMap;
const errors = require('../lib/errors');

module.exports = {
    async get(ctx) {

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
        let sanitizedRecipe = _.omit(recipe, ['ingredients', 'seasonings', 'steps']);
        await ctx.app.db('recipes').insert(humps.decamelizeKeys(sanitizedRecipe));
        //insert steps and stepTags
        let stepTags = [];
        recipe.steps.forEach((step) => {
            step.id = uuid();
            if(step.tags && step.tags.length > 0) {
                stepTags.push(...step.tags.map((tag) => ({
                    id: uuid(),
                    step: step.id,
                    tag: tag
                })));
            }
        });
        let sanitizedSteps = _.omit(recipe.step, ['tags']);
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
        recipe.ingredients.forEach((ingred) => {
            ingred.id = uuid();
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
        let retRecipe = await ctx.app.db('recipes')
            .leftJoin('steps', 'recipes.id', 'steps.recipe')
            .leftJoin('step_tags', 'steps.id', 'step_tags.step')
            .leftJoin('recipe_ingredients', 'recipes.id', 'recipe_ingredients.recipe')
            .leftJoin('ingredients', 'recipe_ingredients.ingredient', 'ingredients.id')
            .leftJoin('ingredient_tags', 'ingredients.id', 'ingredient_tags.ingredient')
            .leftJoin('units', 'ingredients.units', 'units.id')
            .leftJoin('recipe_seasonings', 'recipes.id', 'recipe_seasonings.recipe')
            .leftJoin('seasonings', 'recipe_seasonings.seasoning', 'seasonings.id')
            .leftJoin('recipe_tags', 'recipes.id', 'recipe_tags.recipe')
            .leftJoin('tags', function() {
                this.on('tags.id', '=', 'recipe_tags.tag')
                    .orOn('tags.id', '=', 'ingredient_tags.tag')
                    .orOn('tags.id', '=', 'step_tags.tag')
            })
            .select(...getSelectQueries('recipes', PREFIX.RECIPES, recipesFetchFields.recipes),
                ...getSelectQueries('steps', PREFIX.STEPS, recipesFetchFields.ingredients),
                ...getSelectQueries('step_tags', PREFIX.STEP_TAGS, recipesFetchFields.stepTags),
                ...getSelectQueries('recipe_ingredients', PREFIX.RECIPE_INGREDIENTS, recipesFetchFields.recipeIngredients),
                ...getSelectQueries('ingredients', PREFIX.INGREDIENTS, recipesFetchFields.ingredients),
                ...getSelectQueries('units', PREFIX.UNITS, recipesFetchFields.units),
                ...getSelectQueries('ingredient_tags', PREFIX.INGREDIENT_TAGS, recipesFetchFields.ingredientTags),
                ...getSelectQueries('seasonings', PREFIX.SEASONINGS, recipesFetchFields.seasonings),
                ...getSelectQueries('recipe_seasonings', PREFIX.RECIPE_SEASONINGS, recipesFetchFields.recipeSeasonings),
                ...getSelectQueries('recipe_tags', PREFIX.RECIPE_TAGS, recipesFetchFields.recipeTags))
            .where('recipes.id', recipe.id);
        retRecipe = joinJs.mapOne(retRecipe, relationsMap, 'recipeMap', PREFIX.RECIPES + '_');
        ctx.body = {data: retRecipe};
    },

    async put(ctx) {

    },

    async del(ctx) {

    }
};