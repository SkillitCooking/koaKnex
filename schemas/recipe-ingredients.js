'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps');
const isUUID = require('validator/lib/isUUID');

const recipeIngredientSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'id',
            message: '${path} must be uuid',
            test: val => isUUID(val)
        }),
    recipe: yup.string()
        .test({
            name: 'recipe',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    ingredient: yup.string()
        .test({
            name: 'ingredient',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    isFrozen: yup.boolean().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.default(false)
    ),
    proportion: yup.number().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.default(1)
    )
})
.noUnknown()
.when('$isUpdate', (isUpdate, schema) => isUpdate
    ? schema
    : schema.concat(timeStampSchema)
);

module.exports = recipeIngredientSchema;