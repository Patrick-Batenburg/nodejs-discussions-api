'use strict';
const BaseError = require(APP_ERROR_PATH + 'base');

class UnauthorizedError extends BaseError {
    constructor(message) {
        super(message, 401);
    }
}

module.exports = UnauthorizedError;