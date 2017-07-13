'use strict';

const {ValidationError} = require('yup');
class UnauthorizedError extends Error {};
class ForbiddenError extends Error {};
class NotFoundError extends Error {};
class ServerError extends Error {};

function isDBError(err) {
    return err.code === 'SQLITE_CONSTRAINT' ||
        err.code === '23505'; //PG UNIQUE
}

function getDBErrorMessage(err) {
    if(err.code === 'SQLITE_CONSTRAINT' && err.errno === 19) { //unique constraint
        let index = err.message.lastIndexOf(': ') + 2;
        return 'The value for "' + err.message.substring(index) + '" has already been taken';
    }
    return err.message;
}

module.exports = {
    ValidationError, //401
    ForbiddenError, //403
    NotFoundError, //404
    UnauthorizedError, // 401
    ServerError, //500
    isDBError,
    getDBErrorMessage
};