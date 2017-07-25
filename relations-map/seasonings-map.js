'use strict';

const {PREFIX, MAP_IDS} = require('../lib/constants');
const {propWithPrefix} = require('../lib/helpers');

const seasoningFields = [
    'id',
    'name',
    'is_composite'
];
const childSeasoningFields = [
    'id',
    'name'
];

const relationsMap = [
    {
        mapId: MAP_IDS.SEASONINGS,
        idProperty: 'id',
        properties: [...seasoningFields],
        collections: [
            {name: 'childSeasonings', mapId: MAP_IDS.CHILD_SEASONING}
        ]
    }, {
        mapId: MAP_IDS.CHILD_SEASONING,
        idProperty: {name: 'id', column: PREFIX.CHILD_SEASONINGS + '_id'},
        properties: [...childSeasoningFields.map(propWithPrefix(PREFIX.CHILD_SEASONINGS)),
            {name: 'compSeaId', column: PREFIX.COMPOSING_SEASONINGS + '_id'}
        ]
    }
];

module.exports = {
    relationsMap
};