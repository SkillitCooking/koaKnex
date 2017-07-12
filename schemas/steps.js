'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps');
const isUUID = require('validator/lib/isUUID');

const stepSchema = yup.object().shape({
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
    text: yup.string().required().trim(),
    order: yup.number().integer().min(1).required()
})
.noUnknown()
.concat(timeStampSchema);

module.exports = stepSchema;