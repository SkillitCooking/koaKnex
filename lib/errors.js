'use strict';

const {ValidationError} = require('yup');
class UnauthorizedError extends Error {};
class ForbiddenError extends Error {};
class NotFoundError extends Error {};
class ServerError extends Error {};

module.exports = {
    ValidationError, //401
    ForbiddenError, //403
    NotFoundError, //404
    UnauthorizedError, // 401
    ServerError
    //500
};