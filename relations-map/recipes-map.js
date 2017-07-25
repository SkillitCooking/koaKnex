'use strict';

const {PREFIX} = require('../lib/constants');
const {propWithPrefix} = require('../lib/helpers');

const recipeFields = [
    'id',
    'title',
    'description',
    'main_image_url'
];

const stepFields = [
    'id',
    'text',
    'order'
];

const tagFields = [
    'id',
    'name'
];

const ingredientFields = [
    'id',
    'name_singular',
    'name_plural',
    'description',
    'is_composite',
    'serving_size'
];

const unitsFields = [
    'id',
    'name_singular',
    'name_plural',
    'abbreviation'
];

const seasoningsFields = [
    'id',
    'name',
    'is_composite'
];

const relationsMap = [
    {
        mapId: 'recipesMap',
        idProperty: 'id',
        properties: [...recipeFields],
        collections: [
            {name: 'steps', mapId: 'stepsMap'},
            {name: 'ingredients', mapId: 'ingredientsMap'},
            {name: 'seasonings', mapId: 'seasoningsMap'},
            {name: 'tags', mapId: 'recipeTagsMap'}
        ]
    },
    {
        mapId: 'recipeTagsMap',
        idProperty: {name: 'id', column: PREFIX.R_TAGS + '_id'},
        properties: [...tagFields.map(propWithPrefix(PREFIX.R_TAGS)),
            {name: 'recipeTagId', column: PREFIX.RECIPE_TAGS + '_id'}
        ]
    },
    {
        mapId: 'stepsMap',
        idProperty: {name: 'id', column: PREFIX.STEPS + '_id'},
        properties: [...stepFields.map(propWithPrefix(PREFIX.STEPS))],
        collections: [
            {name: 'tags', mapId: 'stepTagsMap'}
        ]
    },
    {
        mapId: 'stepTagsMap',
        idProperty: {name: 'id', column: PREFIX.S_TAGS + '_id'},
        properties: [...tagFields.map(propWithPrefix(PREFIX.S_TAGS)),
            {name: 'stepTagId', column: PREFIX.STEP_TAGS + '_id'}    
        ]
    },
    {
        mapId: 'ingredientsMap',
        idProperty: {name: 'id', column: PREFIX.INGREDIENTS + '_id'},
        properties: [...ingredientFields.map(propWithPrefix(PREFIX.INGREDIENTS)),
            {name: 'recipeIngId', column: PREFIX.RECIPE_INGREDIENTS + '_id'},
            {name: 'isFrozen', column: PREFIX.RECIPE_INGREDIENTS + '_is_frozen'},
            {name: 'proportion', column: PREFIX.RECIPE_INGREDIENTS + 'proportion'}
        ],
        associations: [
            {name: 'units', mapId: 'unitsMap', columnPrefix: PREFIX.UNITS + '_'}
        ],
        collections: [
            {name: 'tags', mapId: 'ingredientTagsMap'}
        ]
    },
    {
        mapId: 'unitsMap',
        idProperty: 'id',
        properties: [...unitsFields]
    },
    {
        mapId: 'ingredientTagsMap',
        idProperty: {name: 'id', column: PREFIX.I_TAGS + '_id'},
        properties: [...tagFields.map(propWithPrefix(PREFIX.I_TAGS)),
            {name: 'ingTagId', column: PREFIX.INGREDIENT_TAGS + '_id'}
        ]
    },
    {
        mapId: 'seasoningsMap',
        idProperty: {name: 'id', column: PREFIX.SEASONINGS + '_id'},
        properties: [...seasoningsFields.map(propWithPrefix(PREFIX.SEASONINGS)),
            {name: 'recipeSeaId', column: PREFIX.RECIPE_SEASONINGS + '_id'}
        ]
    }
];

module.exports = {
    relationsMap
};