'use strict';
/**
 * Eventually turn into a relationsMap factory???
 */

//will have to map below to Prefixes...

const {PREFIX, MAP_IDS} = require('../lib/constants');
const {propWithPrefix} = require('../lib/helpers');

const ingredientFields = [
    'id',
    'name_singular',
    'store_keeping_name',
    'name_plural',
    'description',
    'is_composite',
    'serving_size',
    'est_total_price',
    'total_size'
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
        mapId: MAP_IDS.INGREDIENTS,
        idProperty: 'id',
        properties: [...ingredientFields],
        associations: [
            {name: 'units', mapId: MAP_IDS.UNITS, columnPrefix: PREFIX.UNITS + '_'}
        ],
        collections: [
            {name: 'tags', mapId: MAP_IDS.TAG},
            {name: 'childIngredients', mapId: MAP_IDS.CHILD_INGREDIENT}
        ]
    },
    {
        mapId: MAP_IDS.UNITS,
        idProperty: 'id',
        properties: [...unitsFields]
    },
    {
        mapId: MAP_IDS.TAG,
        idProperty: {name: 'id', column: PREFIX.TAGS + '_id'},
        properties: [...tagFields.map(propWithPrefix(PREFIX.TAGS)),
            {name: 'ingTagId', column: PREFIX.INGREDIENT_TAGS + '_id'}, 
            {name: 'type', column: PREFIX.INGREDIENT_TAGS + '_type'}
        ]
    },
    {
        mapId: MAP_IDS.CHILD_INGREDIENT,
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