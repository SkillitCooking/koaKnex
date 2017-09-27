'use strict';

const ingredientsMap = require('./ingredients-map').relationsMap;
const seasoningsMap = require('./seasonings-map').relationsMap;
const recipesMap = require('./recipes-map').relationsMap;
const adminUsersMap = require('./users-map').adminRelationsMap;

module.exports = {
    ingredientsMap,
    seasoningsMap,
    recipesMap,
    adminUsersMap
};