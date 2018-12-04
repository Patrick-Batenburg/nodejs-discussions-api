'use strict';
const BaseError = require(APP_ERROR_PATH + 'base');

class ForbiddenError extends BaseError {
    constructor(message) {
        super(message, 403);
    }
}

module.exports = ForbiddenError;