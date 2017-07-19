'use strict';

const {PREFIX} = require('../lib/constants');
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
        mapId: 'seasoningMap',
        idProperty: 'id',
        properties: [...seasoningFields],
        collections: [
            {name: 'childSeasonings', mapId: 'childSeasoningMap'}
        ]
    }, {
        mapId: 'childSeasoningMap',
        idProperty: {name: 'id', column: PREFIX.CHILD_SEASONINGS + '_id'},
        properties: [...childSeasoningFields.map(propWithPrefix(PREFIX.CHILD_SEASONINGS)),
            {name: 'compSeaId', column: PREFIX.COMPOSING_SEASONINGS + '_id'}
        ]
    }
];

module.exports = {
    relationsMap
};