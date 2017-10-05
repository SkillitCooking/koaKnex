'use strict';

const ingredientsMap = require('./ingredients-map').relationsMap;
const seasoningsMap = require('./seasonings-map').relationsMap;
const recipesMap = require('./recipes-map').relationsMap;
const adminUsersMap = require('./users-map').adminRelationsMap;
const mealPlansMap = require('./mealplans-map').relationsMap;

module.exports = {
    ingredientsMap,
    seasoningsMap,
    recipesMap,
    adminUsersMap,
    mealPlansMap
};