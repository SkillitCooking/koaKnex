'use strict';

const users = require('./users');
const ingredients = require('./ingredients');
const ingredientTags = require('./ingredient-tags');
const recipeIngredients = require('./recipe-ingredients');
const recipes = require('./recipes');
const seasonings = require('./seasonings');
const steps = require('./steps');
const tags = require('./tags');
const units = require('./units');

module.exports = function(app) {
    app.schemas = {
        users,
        ingredients,
        ingredientTags,
        recipeIngredients,
        recipes,
        seasonings,
        steps,
        tags,
        units
    };
};