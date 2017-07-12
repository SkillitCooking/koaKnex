'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps');
const isUUID = require('validator/lib/isUUID');

const recipeSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'ide',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    title: yup.string().required().trim(),
    description: yup.string().required().trim(),
    mainImageUrl: yup.string().required().url().trim()
})
.noUnknown()
.concat(timeStampSchema);

module.exports = recipeSchema;