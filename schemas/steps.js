'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps');
const isUUID = require('validator/lib/isUUID');

const stepSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'id',
            message: '${path} must be uuid',
            test: val => isUUID(val)
        }),
    recipe: yup.string()
        .test({
            name: 'recipe',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    text: yup.string().trim().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.required()
    ),
    order: yup.number().integer().min(1).when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.required()
    ),
    oldOrder: yup.number().integer().min(1),
    tags: yup.array().of(yup.string().test({
        name: 'stepTag',
        message: '${path} must be uuid',
        test: val => isUUID(val)
    })),
    tagsToRemove: yup.array().of(yup.string().test({
        name: 'removeStepTags',
        message: '${path} must be uuid',
        test: val => isUUID(val)
    }))
})
.noUnknown()
.when('$isUpdate', (isUpdate, schema) => isUpdate
    ? schema
    : schema.concat(timeStampSchema)
);

module.exports = stepSchema;