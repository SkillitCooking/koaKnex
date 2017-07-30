'use strict';

const validation = require('../lib/validation');
const uuid = require('uuid');
const yup = require('yup');

test('isUUIDArray', async () => {
    let goodArr = [uuid(), uuid()];
    let badArr = [1, 'www'];
    let goodRes = await validation.isUUIDArray(goodArr);
    let badRes = await validation.isUUIDArray(badArr);
    expect(goodRes).toBe(true);
    expect(badRes).toBe(false);
});

test('makeSchemaArray', async () => {
    let schema = yup.string().test({
        name: 'balls',
        message: '${path} is path',
        test: val => val.length === 1 ? true : false
    });
    let arrSchema = validation.makeSchemaArray(schema);
    let goodArr = ['1', '2', '3'];
    let badArr = ['1222', '1', '5'];
    let goodRes = await arrSchema.isValid(goodArr);
    let badRes = await arrSchema.isValid(badArr);
    expect(goodRes).toBe(true);
    expect(badRes).toBe(false);
})