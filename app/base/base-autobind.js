const autoBind = require('auto-bind');

class BaseAutoBindedClass {
    constructor() {
        autoBind(this);
    }
}

module.exports = BaseAutoBindedClass;