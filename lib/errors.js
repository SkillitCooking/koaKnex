'use strict';

const {ValidationError} = require('yup');
class UnauthorizedError extends Error {};
class ForbiddenError extends Error {};
class NotFoundError extends Error {};
class BadRequestError extends Error {};
class ServerError extends Error {};

function isDBError(err) {
    return err.code === 'SQLITE_CONSTRAINT' ||
        err.code === '23505' || //PG_UNIQUE
        err.code === '42703'; //PG_COLUMN ISSUE
}

function getDBErrorMessage(err) {
    if(err.code === 'SQLITE_CONSTRAINT' && err.errno === 19) { //unique constraint
        let index = err.message.lastIndexOf(': ') + 2;
        return 'The value for "' + err.message.substring(index) + '" has already been taken';
    }
    if(err.code === '23505') {
        return err.detail + ' Choose something unique.';
    }
    if(err.code === '42703') {
        return [err.detail, err.message, err.error, err.Error];
    }
    return err.message;
}

module.exports = {
    ValidationError, //422
    BadRequestError, //400
    ForbiddenError, //403
    NotFoundError, //404
    UnauthorizedError, // 401
    ServerError, //500
    isDBError,
    getDBErrorMessage
};