'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps');
const isUUID = require('validator/lib/isUUID');

const ingredientSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'id',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    nameSingular: yup.string().required().lowercase().trim(),
    namePlural: yup.string().required().lowercase().trim(),
    description: yup.string().trim(),
    isComposite: yup.boolean().default(false),
    servingSize: yup.number().default(1),
    units: yup.string()
        .test({
            name: 'units',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        })
})
.noUnknown()
.concat(timeStampSchema);

module.exports = ingredientSchema;