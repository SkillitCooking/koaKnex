'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps');
const isUUID = require('validator/lib/isUUID');

const recipeSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'id',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    title: yup.string().trim().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.required()
    ),
    description: yup.string().trim().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.required()
    ),
    mainImageUrl: yup.string().url().trim().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.required()
    ),
    ingredients: yup.array().of(yup.string().test({
        name: 'ingredients',
        message: '${path} must be uuid',
        test: val => isUUID(val)
    })).when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema.ensure()
        : schema.min(1)
    ),
    seasonings: yup.array().ensure().of(yup.string().test({
        name: 'seasonings',
        message: '${path} must be uuid',
        test: val => isUUID(val)
    })),
    steps: yup.array().of(yup.object().shape({
        text: yup.string().required().trim(),
        tags: yup.array().ensure().of(yup.string().test({
            name: 'stepTags',
            message: '${path} must be uuid',
            test: val => isUUID(val)
        })),
        order: yup.number().min(1).integer().required()
    })).when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema.ensure()
        : schema.min(1)
    ),
    tags: yup.array().ensure().of(yup.string().test({
        name: 'tags',
        message: '${path} must be uuid',
        test: val => isUUID(val)
    }))
})
.noUnknown()
.concat(timeStampSchema);

module.exports = recipeSchema;