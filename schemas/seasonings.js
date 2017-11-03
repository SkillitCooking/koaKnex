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
    name: yup.string().lowercase().trim().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.required()
    ),
    isComposite: yup.boolean().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.default(false)
    ),
    composingSeasonings: yup.array().ensure().of(yup.string().test({
        name: 'composing',
        message: '${path} must be uuid',
        test: val => isUUID(val)
    }))
})
    .noUnknown()
    .when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.concat(timeStampSchema)
    );

module.exports = seasoningSchema;