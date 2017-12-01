'use strict';

//initialize new db to dev db
const {DB_CLIENT, DB_CONNECTION, DEV_DB_CLIENT, DEV_DB_CONNECTION} = process.env;

module.exports = {
    //TODO - add in conditional handling for just reseeding a portion...
    async reseedDev(ctx) {
        if(DB_CLIENT === 'pg' && DEV_DB_CLIENT === 'pg') {
            //intialize new db
            const devDB = require('knex')({
                client: DEV_DB_CLIENT,
                connection: DEV_DB_CONNECTION
            });
            let tags = await ctx.app.db('tags').select();
            let recipes = await ctx.app.db('recipes').select();
            let units = await ctx.app.db('units').select();
            let seasonings = await ctx.app.db('seasonings').select();
            let meal_plan_email_types = await ctx.app.db('meal_plan_email_types').select();
            let ingredients = await ctx.app.db('ingredients').select();
            let steps = await ctx.app.db('steps').select();
            let step_tags = await ctx.app.db('step_tags').select();
            let recipe_tags = await ctx.app.db('recipe_tags').select();
            let recipe_seasonings = await ctx.app.db('recipe_seasonings').select();
            let recipe_ingredients = await ctx.app.db('recipe_ingredients').select();
            let ingredient_tags = await ctx.app.db('ingredient_tags').select();
            let composing_seasonings = await ctx.app.db('composing_seasonings').select();
            let composing_ingredients = await ctx.app.db('composing_ingredients').select();

            await devDB('tags').insert(tags);
            await devDB('recipes').insert(recipes);
            await devDB('units').insert(units);
            await devDB('ingredients').insert(ingredients);
            await devDB('seasonings').insert(seasonings);
            await devDB('meal_plan_email_types').insert(meal_plan_email_types);
            await devDB('steps').insert(steps);
            await devDB('step_tags').insert(step_tags);
            await devDB('recipe_tags').insert(recipe_tags);
            await devDB('recipe_seasonings').insert(recipe_seasonings);
            await devDB('recipe_ingredients').insert(recipe_ingredients);
            await devDB('ingredient_tags').insert(ingredient_tags);
            await devDB('composing_seasonings').insert(composing_seasonings);
            await devDB('composing_ingredients').insert(composing_ingredients);

            ctx.body = {msg: 'Reseeding successful'};
        } else {
            ctx.body = {msg: 'Only will reseed if using remote Dev_Db'};
        }
    }
};

/**
 * -tags
-steps
-units
-step_tags
-seasonings
-recipes
-recipe_tags
-recipe_seasonings
-recipe_ingredients
-meal_plan_email_types
-ingredients
-ingredient_tags
-composing_seasonings
-composing_ingredients
 */