'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps');
const isUUID = require('validator/lib/isUUID');

const recipeIngredientSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'id',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
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
    isFrozen: yup.boolean().default(false),
    proportion: yup.number().default(1)
})
.noUnknown()
.concat(timeStampSchema);

module.exports = recipeIngredientSchema;