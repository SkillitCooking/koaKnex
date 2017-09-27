'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps.js');
const isUUID = require('validator/lib/isUUID');

function isValidGender(gender) {
    return gender === 'M'
        || gender === 'F';
}

const userSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'id',
            message: '${path} must be uuid',
            test: value => value ? isUUID(value) : true
        }),
    username: yup.string()
        .max(30)
        .trim()
        .when('$isUpdate', (isUpdate, schema) => isUpdate
            ? schema
            : schema.required()
    ),
    email: yup.string()
        .email()
        .lowercase()
        .trim()
        .when('$isUpdate', (isUpdate, schema) => isUpdate
            ? schema
            : schema.required()
    ),
    firstName: yup.string()
        .trim(),
    lastName: yup.string()
        .trim(),
    address: yup.object().shape({
        street: yup.string().required(),
        street2: yup.string(),
        city: yup.string().required().trim(),
        state: yup.string().required().trim(),
        zip: yup.string().required().trim()
    }).noUnknown(),
    age: yup.number().positive(),
    gender: yup.string().uppercase().test({
        name: 'gender',
        message: '${path} must be uuid',
        test: value => value ? isValidGender(value) : true
    }),
    isDueForMealPlan: yup.boolean().default(false),
    deliveryPreferences: yup.object().shape({
        id: yup.string().test({
            name: 'deliveryPreferences',
            message: '${path} must be uuid',
            test: val => val ? isUUID(val) : true
        }),
        mealsPerWeek: yup.number().positive().required(),
        minDeliveriesPerWeek: yup.number().positive().required(),
        maxDeliveriesPerWeek: yup.number().positive().required(),
        servingsPerMeal: yup.number().positive().required()
    }).when('$isUpdate', (isUpdate, schema) => isUpdate
        ? schema
        : schema.required()
    ).noUnknown().strict(),
    previousMealPlan: yup.string().test({
        name: 'lastMeal',
        message: '${path} must be uuid',
        test: val => val ? isUUID(val) : true
    }),
    isAdmin: yup.boolean().default(false),
    password: yup.string()
        .when('$validatePassword', {
            is: true,
            then: yup.string().required().min(8).max(30)
        })
})
.noUnknown()
.when('$isUpdate', (isUpdate, schema) => isUpdate
    ? schema
    : schema.concat(timeStampSchema)
);

module.exports = userSchema;