'use strict';

const users = require('./users');
const ingredients = require('./ingredients');
const tags = require('./tags');
const units = require('./units');
const seasonings = require('./seasonings');
const recipes = require('./recipes');
const mealPlanEmailTypes = require('./mealPlanEmailTypes');
const mealPlans = require('./mealPlans');
const adminUtil = require('./adminUtil');

/**
 * Explore how to use transactions with knex in layered queries that
 * may be conditional and need rollback...
 * EG steps with recipes
 */

module.exports = {
    users,
    ingredients,
    tags,
    units,
    seasonings,
    recipes,
    mealPlanEmailTypes,
    mealPlans,
    adminUtil
};