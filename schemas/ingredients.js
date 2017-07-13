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
        }),
    category: yup.string()
        .test({
            name: 'category',
            message: '${path} must be uuid',
            test: val => isUUID(val)
        }),
    tags: yup.array().ensure().of(yup.string().test({
        name: 'tags',
        message: '${path} must be uuid',
        test: val => isUUID(val)
    })),
    composingIngredients: yup.array().ensure().of(yup.string().test({
        name: 'composingIngredients',
        message: '${path} must be uuid',
        test: val => isUUID(val)
    }))
})
.noUnknown()
.concat(timeStampSchema);

module.exports = ingredientSchema;