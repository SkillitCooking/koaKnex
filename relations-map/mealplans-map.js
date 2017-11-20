'use strict';

const {PREFIX, MAP_IDS} = require('../lib/constants');
const {propWithPrefix} = require('../lib/helpers');

const mealPlanFields = [
    'id',
    'user',
    'delivery_time',
    'delivery_timezone',
    'title',
    'overview'
];

const recipeFields = [
    'id',
    'title',
    'description',
    'main_image_url',
    'total_time',
    'active_time',
    'main_link_url'
];

const stepFields = [
    'id',
    'text',
    'order',
    'main_link_url'
];

const tagFields = [
    'id',
    'name'
];

const ingredientFields = [
    'id',
    'name_singular',
    'name_plural',
    'store_keeping_name',
    'description',
    'is_composite',
    'serving_size',
    'est_total_price',
    'total_size'
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
        mapId: MAP_IDS.MEAL_PLANS,
        idProperty: 'id',
        properties: [...mealPlanFields],
        collections: [
            {name: 'recipes', mapId: MAP_IDS.RECIPES} //will need to have propWithPrefix for Recipes...
        ]
    },
    {
        mapId: MAP_IDS.RECIPES,
        idProperty: {name: 'id', column: PREFIX.RECIPES + '_id'},
        properties: [...recipeFields.map(propWithPrefix(PREFIX.RECIPES)),
            {name: 'recipeMealPlanId', column: PREFIX.MEAL_PLAN_RECIPE + '_id'},
            {name: 'mealPlanOrder', column: PREFIX.MEAL_PLAN_RECIPE + '_order'}            
        ],
        collections: [
            {name: 'steps', mapId: MAP_IDS.STEPS},
            {name: 'ingredients', mapId: MAP_IDS.INGREDIENTS},
            {name: 'seasonings', mapId: MAP_IDS.SEASONINGS},
            {name: 'tags', mapId: MAP_IDS.RECIPE_TAGS}
        ]
    },
    {
        mapId: MAP_IDS.RECIPE_TAGS,
        idProperty: {name: 'id', column: PREFIX.R_TAGS + '_id'},
        properties: [...tagFields.map(propWithPrefix(PREFIX.R_TAGS)),
            {name: 'recipeTagId', column: PREFIX.RECIPE_TAGS + '_id'}
        ]
    },
    {
        mapId: MAP_IDS.STEPS,
        idProperty: {name: 'id', column: PREFIX.STEPS + '_id'},
        properties: [...stepFields.map(propWithPrefix(PREFIX.STEPS))],
        collections: [
            {name: 'tags', mapId: MAP_IDS.STEP_TAGS}
        ]
    },
    {
        mapId: MAP_IDS.STEP_TAGS,
        idProperty: {name: 'id', column: PREFIX.S_TAGS + '_id'},
        properties: [...tagFields.map(propWithPrefix(PREFIX.S_TAGS)),
            {name: 'stepTagId', column: PREFIX.STEP_TAGS + '_id'}    
        ]
    },
    {
        mapId: MAP_IDS.INGREDIENTS,
        idProperty: {name: 'id', column: PREFIX.INGREDIENTS + '_id'},
        properties: [...ingredientFields.map(propWithPrefix(PREFIX.INGREDIENTS)),
            {name: 'recipeIngId', column: PREFIX.RECIPE_INGREDIENTS + '_id'},
            {name: 'isFrozen', column: PREFIX.RECIPE_INGREDIENTS + '_is_frozen'},
            {name: 'proportion', column: PREFIX.RECIPE_INGREDIENTS + '_proportion'}
        ],
        associations: [
            {name: 'units', mapId: MAP_IDS.UNITS, columnPrefix: PREFIX.UNITS + '_'}
        ],
        collections: [
            {name: 'tags', mapId: MAP_IDS.INGREDIENT_TAGS}
        ]
    },
    {
        mapId: MAP_IDS.UNITS,
        idProperty: 'id',
        properties: [...unitsFields]
    },
    {
        mapId: MAP_IDS.INGREDIENT_TAGS,
        idProperty: {name: 'id', column: PREFIX.I_TAGS + '_id'},
        properties: [...tagFields.map(propWithPrefix(PREFIX.I_TAGS)),
            {name: 'ingTagId', column: PREFIX.INGREDIENT_TAGS + '_id'}
        ]
    },
    {
        mapId: MAP_IDS.SEASONINGS,
        idProperty: {name: 'id', column: PREFIX.SEASONINGS + '_id'},
        properties: [...seasoningsFields.map(propWithPrefix(PREFIX.SEASONINGS)),
            {name: 'recipeSeaId', column: PREFIX.RECIPE_SEASONINGS + '_id'},
            {name: 'presentOrder', column: PREFIX.RECIPE_SEASONINGS + '_id'}
        ]
    }
];

module.exports = {
    relationsMap
};
