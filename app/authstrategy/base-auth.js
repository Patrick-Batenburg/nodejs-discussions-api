const BasePassportStrategy = require('passport-strategy');

class BaseAuthStrategy extends BasePassportStrategy {
    constructor() {
        super();
    }

    _initStrategy() {
        throw new Error("Not Implemented");
    }

    authenticate(req) {
        throw new Error("Not Implemented");
    }

    authenticate(req, options) {
        throw new Error("Not Implemented");
    }

    get name() {
        throw new Error("Not Implemented");
    }

    provideOptions() {
        throw new Error("Not Implemented");
    }

    provideSecretKey() {
        throw new Error("Not Implemented");
    }
}

exports = module.exports = BaseAuthStrategy;