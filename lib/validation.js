'use strict';

const _ = require('lodash');
const yup = require('yup');
const isUUID = require('validator/lib/isUUID');

function cannotAuthenticate(user) {
    return !_.isObject(user) || !user.username || !user.password;
}

function validateClient(clientPassword) {
    return clientPassword === process.env.CLIENT_PASSWORD;
}

async function isUUIDArray(arr) {
    let schema = yup.array().of(yup.string().test({
        name: 'uuid',
        message: '${path} must be uuid',
        test: val => isUUID(val)
    }));
    return await schema.isValid(arr);
}

function makeSchemaArray(schema) {
    return yup.array().of(schema);
}

exports.cannotAuthenticate = cannotAuthenticate;
exports.validateClient = validateClient;
exports.isUUIDArray = isUUIDArray;
exports.makeSchemaArray = makeSchemaArray;