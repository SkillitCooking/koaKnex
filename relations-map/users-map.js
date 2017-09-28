'use strict';

const {PREFIX, MAP_IDS} = require('../lib/constants');
const {propWithPrefix} = require('../lib/helpers');

const userAdminFields = [
    'id',
    'username',
    'email',
    'first_name',
    'last_name',
    'address_street',
    'address_street2',
    'address_city',
    'address_state',
    'address_zip',
    'age',
    'gender',
    'is_due_for_meal_plan',
    'is_admin',
    'password'
];

const deliveryPreferencesFields = [
    'id',
    'user',
    'meals_per_week',
    'min_deliveries_per_week',
    'max_deliveries_per_week',
    'servings_per_meal'
];

const adminRelationsMap = [
    {
        mapId: MAP_IDS.USERS,
        idProperty: 'id',
        properties: [...userAdminFields],
        associations: [
            {name: 'deliveryPreferences', mapId: MAP_IDS.DELIVERY_PREFERENCES, columnPrefix: PREFIX.DELIVERY_PREFERENCES + '_'}
        ]
    },
    {
        mapId: MAP_IDS.DELIVERY_PREFERENCES,
        idProperty: 'id',
        properties: [...deliveryPreferencesFields]
    }
];

module.exports = {
    adminRelationsMap
};