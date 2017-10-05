'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps.js');
const isUUID = require('validator/lib/isUUID');

const mealPlansSchema = yup.object().shape({
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
    deliveryTime: yup.date()
        .when('$isUpdate', (isUpdate, schema) => isUpdate
            ? schema
            : schema.required()
    ),
    recipes: yup.array().of(yup.string().test({
        name: 'recipes',
        message: '${path} must be uuid',
        test: val => isUUID(val)
    })).when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema.ensure()
        : schema.min(1)
    ),
    title: yup.string().trim().max(50),
    overview: yup.string().trim()
})
.noUnknown()
.when('$isUpdate', (isUpdate, schema) => isUpdate
    ? schema
    : schema.concat(timeStampSchema)
);

module.exports = mealPlansSchema;