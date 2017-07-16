'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps');
const isUUID = require('validator/lib/isUUID');

const unitSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'id',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    nameSingular: yup.string().lowercase().trim().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema 
        : schema.required()
    ),
    namePlural: yup.string().lowercase().trim().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.required()
    ),
    abbreviation: yup.string().lowercase().trim()
})
.noUnknown()
.when('$isUpdate', (isUpdate, schema) => isUpdate
    ? schema
    : schema.concat(timeStampSchema)
);

module.exports = unitSchema;