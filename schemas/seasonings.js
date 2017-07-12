'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps');
const isUUID = require('validator/lib/isUUID');

const seasoningSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'id',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    name: yup.string().required().lowercase().trim(),
    isComposite: yup.boolean().default(false)
})
.noUnknown()
.concat(timeStampSchema);

module.exports = seasoningSchema;