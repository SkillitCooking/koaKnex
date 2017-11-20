'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps');
const isUUID = require('validator/lib/isUUID');

const recipeSeasoningSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'id',
            message: '${path} must be uuid',
            test: val => isUUID(val)
        }),
    recipe:  yup.string()
        .test({
            name: 'recipe',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    seasoning: yup.string()
        .test({
            name: 'seasoning',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    presentOrder: yup.number().integer().default(1)
})
    .noUnknown()
    .when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.concat(timeStampSchema)
    );

module.exports = recipeSeasoningSchema;