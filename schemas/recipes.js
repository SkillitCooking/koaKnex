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
    activeTime: yup.number().integer().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.required()
    ),
    totalTime: yup.number().integer().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.required()
    ),
    mainImageUrl: yup.string().url().trim().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.required()
    ),
    ingredients: yup.array().of(yup.object().shape({
        ingredient: yup.string().required().test({
            name: 'ingredient',
            message: '${path} must be uuid',
            test: val => isUUID(val)
        }),
        isFrozen: yup.boolean().default(false),
        proportion: yup.number().positive().default(1)
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