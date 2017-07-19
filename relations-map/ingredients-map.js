'use strict';
/**
 * Eventually turn into a relationsMap factory???
 */

//will have to map below to Prefixes...

const {PREFIX} = require('../lib/constants');
const {propWithPrefix} = require('../lib/helpers');

const ingredientFields = [
    'id',
    'name_singular',
    'name_plural',
    'description',
    'is_composite',
    'serving_size'
];

const childIngredientFields = [
    'id',
    'name_singular',
    'name_plural'
];

const tagFields = [
    'id',
    'name'
];

const unitsFields = [
    'id',
    'name_singular',
    'name_plural',
    'abbreviation'
];

const relationsMap = [
    {
        mapId: 'ingredientMap',
        idProperty: 'id',
        properties: [...ingredientFields],
        associations: [
            {name: 'units', mapId: 'unitsMap', columnPrefix: PREFIX.UNITS + '_'}
        ],
        collections: [
            {name: 'tags', mapId: 'tagMap'},
            {name: 'childIngredients', mapId: 'childIngredientMap'}
        ]
    },
    {
        mapId: 'unitsMap',
        idProperty: 'id',
        properties: [...unitsFields]
    },
    {
        mapId: 'tagMap',
        idProperty: {name: 'id', column: PREFIX.TAGS + '_id'},
        properties: [...tagFields.map(propWithPrefix(PREFIX.TAGS)),
            {name: 'ingTagId', column: PREFIX.INGREDIENT_TAGS + '_id'}, 
            {name: 'type', column: PREFIX.INGREDIENT_TAGS + '_type'}
        ]
    },
    {
        mapId: 'childIngredientMap',
        idProperty: {name: 'id', column: PREFIX.CHILD_INGREDIENTS + '_id'},
        properties: [...childIngredientFields.map(propWithPrefix(PREFIX.CHILD_INGREDIENTS)), 
            {name: 'compIngId', column: PREFIX.COMPOSING_INGREDIENTS + '_id'},
            {name: 'isOptional', column: PREFIX.COMPOSING_INGREDIENTS + '_is_optional'}
        ]
    }
];

module.exports = {
    relationsMap
};