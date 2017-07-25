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
        const {body} = ctx.request;
        let {ids = []} = body;
        let query = ctx.app.db('recipes')
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
                ...getSelectQueries('i_tags', PREFIX.I_TAGS, recipesFetchFields.tags))
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
        let recipeIngredients = recipe.ingredients.map(ingred => {
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
                ...getSelectQueries('i_tags', PREFIX.I_TAGS, recipesFetchFields.tags))
            .where('recipes.id', recipe.id);
        retRecipe = joinJs.mapOne(retRecipe, relationsMap, 'recipesMap', PREFIX.RECIPES + '_');
        ctx.body = {data: retRecipe};
    },

    async put(ctx) {

    },

    async del(ctx) {

    }
};