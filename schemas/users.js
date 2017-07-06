'use strict';

const yup = require('yup');
const timeStampSchema = require('./timestamps.js');
const isUUID = require('validator/lib/isUUID');

const userSchema = yup.object().shape({
    id: yup.string()
        .test({
            name: 'id',
            message: '${path} must be uuid',
            test: value => value ? isUUID(value) : true
        }),
    username: yup.string()
        .required()
        .max(30)
        .trim(),
    email: yup.string()
        .required()
        .email()
        .lowercase()
        .trim(),
    isAdmin: yup.boolean().default(false),
    password: yup.string()
        .when('$validatePassword', {
            is: true,
            then: yup.string().required().min(8).max(30)
        })
}).noUnknown().concat(timeStampSchema);

module.exports = userSchema;