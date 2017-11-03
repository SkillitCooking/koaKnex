'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps');
const isUUID = require('validator/lib/isUUID');

const tagSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'id',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    name: yup.string().required().lowercase().trim()
})
    .noUnknown()
    .when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.concat(timeStampSchema)
    );

module.exports = tagSchema;


