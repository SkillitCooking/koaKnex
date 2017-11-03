'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps');
const isUUID = require('validator/lib/isUUID');

const ingredientTagSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'id',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    ingredient: yup.string()
        .test({
            name: 'ingredient',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    tag: yup.string()
        .test({
            name: 'tag',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    type: yup.string().uppercase().trim()
})
    .noUnknown()
    .concat(timeStampSchema);

module.exports = ingredientTagSchema;