const BaseController = require(APP_CONTROLLER_PATH + 'base');
const ThreadHandler = require(APP_HANDLER_PATH + 'thread');

class ThreadController extends BaseController {
    constructor() {
        super();
        this._threadHandler = new ThreadHandler();
        this._passport = require('passport');
    }

    getAll(req, res, next) {
        this.authenticate(req, res, next, (token, user) => {
            this._threadHandler.getAllThreads(req, this._responseManager.getDefaultResponseHandler(res));
        });
    }

    get(req, res, next) {
        let responseManager = this._responseManager;
        this.authenticate(req, res, next, (token, user) => {
            this._threadHandler.getSingleThread(req, responseManager.getDefaultResponseHandlerError(res, ((data, message, code) => {
                let hateosLinks = [responseManager.generateHATEOASLink(req.baseUrl, "GET", "collection")];
                responseManager.respondWithSuccess(res, code || responseManager.HTTP_STATUS.OK, data, message, hateosLinks);
            })));
        });
    }

    create(req, res, next) {
        this.authenticate(req, res, next, (token, user) => {
            this._threadHandler.createNewThread(req, this._responseManager.getDefaultResponseHandler(res));
        });
    }

    update(req, res, next) {
        this.authenticate(req, res, next, (token, user) => {
            this._threadHandler.updateThread(req, this._responseManager.getDefaultResponseHandler(res));
        });
    }

    remove(req, res, next) {
        this.authenticate(req, res, next, (token, user) => {
            this._threadHandler.deleteThread(req, this._responseManager.getDefaultResponseHandler(res));
        });
    }

    authenticate(req, res, next, callback) {
        let responseManager = this._responseManager;
        this._passport.authenticate('jwt-rs-auth', {
            onVerified: callback,
            onFailure: function (error) {
                responseManager.respondWithError(res, error.status || 401, error.message);
            }
        })(req, res, next);
    }
}

module.exports = ThreadController;