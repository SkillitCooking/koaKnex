'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps.js');
const isUUID = require('validator/lib/isUUID');

const deliveryPreferencesSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'id',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    user: yup.string()
        .test({
            name: 'user',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    mealsPerWeek: yup.number().positive()
        .when('$isUpdate', (isUpdate, schema) => isUpdate
           ? schema
           : schema.required() 
    ),
    minDeliveriesPerWeek: yup.number().positive()
        .when('isUpdate', (isUpdate, schema) => isUpdate
            ? schema
            : schema.required()
    ),
    maxDeliveriesPerWeek: yup.number().positive()
        .when('isUpdate', (isUpdate, schema) => isUpdate
            ? schema
            : schema.required()
    ),
    servingsPerMeal:  yup.number().positive()
        .when('isUpdate', (isUpdate, schema) => isUpdate
            ? schema
            : schema.required()
    ),
})
.noUnknown()
.when('$isUpdate', (isUpdate, schema) => isUpdate
    ? schema
    : schema.concat(timeStampSchema)
);

module.exports = deliveryPreferencesSchema;