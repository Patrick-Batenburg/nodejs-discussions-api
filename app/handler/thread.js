const ThreadModel = require(APP_MODEL_PATH + 'thread').ThreadModel;
const UserModel = require(APP_MODEL_PATH + 'user').UserModel;
const ValidationError = require(APP_ERROR_PATH + 'validation');
const NotFoundError = require(APP_ERROR_PATH + 'not-found');
const BaseAutoBindedClass = require(APP_BASE_PACKAGE_PATH + 'base-autobind');

class ThreadHandler extends BaseAutoBindedClass {
    constructor() {
        super();
        this._validator = require('validator');
    }

    static get THREAD_VALIDATION_SCHEME() {
        return {
            'title': {
                notEmpty: true,
                isLength: {
                    options: [{
                        min: 1,
                        max: 150
                    }],
                    errorMessage: 'Thread title must be between 1 and 150 chars long'
                },
                errorMessage: 'Invalid thread title'
            },
            'content': {
                notEmpty: true,
                isLength: {
                    options: [{
                        min: 1,
                        max: 3000
                    }],
                    errorMessage: 'Thread content must be between 1 and 3000 chars long'
                },
                errorMessage: 'Invalid thread content'
            },
            'author.id': {
                isMongoId: {
                    errorMessage: 'Invalid Author Id'
                },
                errorMessage: "Invalid Author Id"
            }
        };
    }

    createNewThread(req, callback) {
        let data = req.body;
        let validator = this._validator;
        let newThread;
        req.checkBody(ThreadHandler.THREAD_VALIDATION_SCHEME);
        req.getValidationResult()
            .then(function (result) {
                if (!result.isEmpty()) {
                    let errorMessages = result.array().map(function (elem) {
                        return elem.msg;
                    });

                    throw new ValidationError('There are validation errors: ' + errorMessages.join(' && '));
                }

                newThread = new ThreadModel({
                    title: validator.trim(data.title),
                    content: validator.trim(data.content),
                    author: {
                        id: data.author.id,
                        username: ''
                    }
                });

                return UserModel.findById(data.author.id);
            })
            .then((user) => {
                newThread.author.username = user.username;
                return newThread;
            })
            .then((thread) => {
                thread.save();
                return thread;
            })
            .then((saved) => {
                callback.onSuccess(saved);
            })
            .catch((error) => {
                callback.onError(error);
            });
    }

    deleteThread(req, callback) {
        let data = req.body;
        req.checkParams('threadId', 'Invalid thread id provided').isMongoId();
        req.checkParams('userId', 'Invalid user id provided').isMongoId();
        req.getValidationResult()
            .then(function (result) {
                if (!result.isEmpty()) {
                    let errorMessages = result.array().map(function (elem) {
                        return elem.msg;
                    });

                    throw new ValidationError('There are validation errors: ' + errorMessages.join(' && '));
                }

                return new Promise(function (resolve, reject) {
                    ThreadModel.findOne({
                        _id: req.params.threadId,
                        'author.id': req.params.userId
                    }, function (err, thread) {
                        if (err !== null) {
                            reject(err);
                        } else {
                            if (!thread) {
                                reject(new NotFoundError('Thread not found'));
                            } else {
                                resolve(thread);
                            }
                        }
                    });
                });
            })
            .then((thread) => {
                thread.remove();
                return thread;
            })
            .then((deleted) => {
                callback.onSuccess(deleted);
            })
            .catch((error) => {
                callback.onError(error);
            });
    }

    updateThread(req, callback) {
        let data = req.body;
        let validator = this._validator;
        let validationScheme = ThreadHandler.THREAD_VALIDATION_SCHEME;
        delete validationScheme.title;
        req.checkBody(validationScheme);
        req.getValidationResult()
            .then(function (result) {
                if (!result.isEmpty()) {
                    let errorMessages = result.array().map(function (elem) {
                        return elem.msg;
                    });

                    throw new ValidationError('There are validation errors: ' + errorMessages.join(' && '));
                }
                
                return new Promise(function (resolve, reject) {
                    ThreadModel.findOne({
                        _id: req.params.id,
                        'author.id': data.author.id
                    }, function (err, thread) {
                        if (err) {
                            reject(err);
                        } else {
                            if (!thread) {
                                reject(new NotFoundError("Thread not found"));
                            } else {
                                resolve(thread);
                            }
                        }
                    });
                });
            })
            .then((thread) => {
                thread.set({
                    content: validator.trim(data.content)
                });
                
                return thread.save();
            })
            .then((updated) => {
                callback.onSuccess(updated);
            })
            .catch((error) => {
                callback.onError(error);
            });
    }

    getSingleThread(req, callback) {
        let data = req.body;
        req.checkParams('id', 'Invalid thread id provided').isMongoId();
        req.getValidationResult()
            .then(function (result) {
                if (!result.isEmpty()) {
                    let errorMessages = result.array().map(function (elem) {
                        return elem.msg;
                    });

                    throw new ValidationError('There are validation errors: ' + errorMessages.join(' && '));
                }

                return new Promise(function (resolve, reject) {
                    ThreadModel.findOne({
                        _id: req.params.id
                    }, function (err, thread) {
                        if (err !== null) {
                            reject(err);
                        } else {
                            if (!thread) {
                                reject(new NotFoundError('Thread not found'));
                            } else {
                                resolve(thread);
                            }
                        }
                    }).populate('comments', '-__v');
                });
            })
            .then((thread) => {
                callback.onSuccess(thread);
            })
            .catch((error) => {
                callback.onError(error);
            });
    }

    getAllThreads(req, callback) {
        let data = req.body;
        new Promise(function (resolve, reject) {
                ThreadModel.find({}, function (err, threads) {
                    if (err !== null) {
                        reject(err);
                    } else {
                        resolve(threads);
                    }
                });
            })
            .then((threads) => {
                callback.onSuccess(threads);
            })
            .catch((error) => {
                callback.onError(error);
            });
    }
}

module.exports = ThreadHandler;