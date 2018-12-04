'use strict';
const BaseError = require(APP_ERROR_PATH + 'base');

class ValidationError extends BaseError {
    constructor(message) {
        super(message, 400);
    }
}

module.exports = ValidationError;