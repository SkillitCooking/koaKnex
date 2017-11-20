'use strict';

const users = require('./users');
const ingredients = require('./ingredients');
const ingredientTags = require('./ingredient-tags');
const recipeIngredients = require('./recipe-ingredients');
const recipeSeasonings = require('./recipe-seasonings');
const recipes = require('./recipes');
const seasonings = require('./seasonings');
const steps = require('./steps');
const tags = require('./tags');
const units = require('./units');
const deliveryPreferences = require('./deliveryPreferences');
const mealPlans = require('./mealPlans');

module.exports = function(app) {
    app.schemas = {
        users,
        ingredients,
        ingredientTags,
        recipeIngredients,
        recipeSeasonings,
        recipes,
        seasonings,
        steps,
        tags,
        units,
        deliveryPreferences,
        mealPlans
    };
};