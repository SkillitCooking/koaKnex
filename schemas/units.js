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
    nameSingular: yup.string().required().lowercase().trim(),
    namePlural: yup.string().required().lowercase().trim()
})
.noUnknown()
.concat(timeStampSchema);

module.exports = unitSchema;