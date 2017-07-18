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
    nameSingular: yup.string().lowercase().trim().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.required()
    ),
    namePlural: yup.string().lowercase().trim().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.required()
    ),
    description: yup.string().trim(),
    //how to index this to presence of relations in composing_ingredients
    //that use it as a parent?
    isComposite: yup.boolean().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.default(false)
    ),
    servingSize: yup.number().when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.default(1)
    ),
    units: yup.string()
        .test({
            name: 'units',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    category: yup.string()
        .test({
            name: 'category',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
    tags: yup.array().ensure().of(yup.string().test({
        name: 'tags',
        message: '${path} must be uuid',
        test: val => isUUID(val)
    })),
    composingIngredients: yup.array().ensure().of(yup.array().min(2).max(2).test({
        name: 'composingIngredients',
        message: '${path} must be [uuid, boolean]',
        test: val => {
            return isUUID(val[0]) &&
                typeof val[1] === 'boolean';
        }
    }))
})
.noUnknown()
.when('$isUpdate', (isUpdate, schema) => isUpdate
    ? schema
    : schema.concat(timeStampSchema)
);

module.exports = ingredientSchema;