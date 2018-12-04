const ThreadModel = require(APP_MODEL_PATH + 'thread').ThreadModel;
const CommentModel = require(APP_MODEL_PATH + 'comment').CommentModel;
const UserModel = require(APP_MODEL_PATH + 'user').UserModel;
const ValidationError = require(APP_ERROR_PATH + 'validation');
const NotFoundError = require(APP_ERROR_PATH + 'not-found');
const BaseAutoBindedClass = require(APP_BASE_PACKAGE_PATH + 'base-autobind');

class CommentHandler extends BaseAutoBindedClass {
    constructor() {
        super();
        this._validator = require('validator');
    }

    static get COMMENT_VALIDATION_SCHEME() {
        return {
            'content': {
                notEmpty: true,
                isLength: {
                    options: [{
                        min: 1,
                        max: 3000
                    }],
                    errorMessage: 'Comment content must be between 1 and 3000 chars long'
                },
                errorMessage: 'Invalid comment content'
            },
            'authorId': {
                isMongoId: {
                    errorMessage: 'Invalid Author Id'
                },
                errorMessage: "Invalid Author Id"
            }
        };
    }

    createNewComment(req, callback) {
        let data = req.body;
        let validator = this._validator;
        let newComment;
        req.checkParams('id', 'Invalid thread or comment id provided').isMongoId();
        req.checkBody(CommentHandler.COMMENT_VALIDATION_SCHEME);
        req.getValidationResult()
            .then(function (result) {
                if (!result.isEmpty()) {
                    let errorMessages = result.array().map(function (elem) {
                        return elem.msg;
                    });
                    throw new ValidationError('There are validation errors: ' + errorMessages.join(' && '));
                }

                newComment = new CommentModel({
                    content: validator.trim(data.content),
                    authorId: data.authorId
                });

                return UserModel.findById(data.authorId);
            })
            .then((user) => {
                newComment.username = user.fullName;
                return newComment;
            })
            .then((comment) => {
                return new Promise(function (resolve, reject) {
                    comment.save();

                    ThreadModel.findOne({
                        _id: req.params.id
                    }, function (err, thread) {
                        if (err !== null) {
                            reject(err);
                        } else {
                            if (!thread) {
                                CommentModel.findOne({
                                    _id: req.params.id
                                }, function (err, comment) {
                                    if (err !== null) {
                                        reject(err);
                                    } else {
                                        if (!comment) {
                                            reject(new NotFoundError("Thread or comment not found"));
                                        } else {
                                            resolve(comment);
                                        }
                                    }
                                })
                            } else {
                                resolve(thread);
                            }
                        }
                    })
                });
            })
            .then((post) => {
                post.comments = post.comments.concat(newComment);
                post.save();
                return post;
            })
            .then((saved) => {
                callback.onSuccess(saved);
            })
            .catch((error) => {
                callback.onError(error);
            });
    }

    deleteComment(req, callback) {
        let data = req.body;
        req.checkParams('id', 'Invalid comment id provided').isMongoId();
        req.getValidationResult()
            .then(function (result) {
                if (!result.isEmpty()) {
                    let errorMessages = result.array().map(function (elem) {
                        return elem.msg;
                    });
                    throw new ValidationError('There are validation errors: ' + errorMessages.join(' && '));
                }

                return new Promise(function (resolve, reject) {
                    CommentModel.findOne({
                        _id: req.params.id
                    }, function (err, comment) {
                        if (err !== null) {
                            reject(err);
                        } else {
                            if (!comment) {
                                reject(new NotFoundError("Comment not found"));
                            } else {
                                resolve(comment);
                            }
                        }
                    })
                });
            })
            .then((comment) => {
                return new Promise(function (resolve, reject) {
                    comment.set('content', '[Deleted]');
                    comment.set('username', '[Deleted]');
                    comment.save()
                    comment.save(function (err, comment) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(comment);
                        }
                    });
                });
            })
            .then((saved) => {
                callback.onSuccess(saved);
            })
            .catch((error) => {
                callback.onError(error);
            });
    }

    updateComment(req, callback) {
        let data = req.body;
        let validator = this._validator;
        req.checkBody(CommentHandler.COMMENT_VALIDATION_SCHEME);
        req.getValidationResult()
            .then(function (result) {
                if (!result.isEmpty()) {
                    let errorMessages = result.array().map(function (elem) {
                        return elem.msg;
                    });
                    throw new ValidationError('There are validation errors: ' + errorMessages.join(' && '));
                }

                return new Promise(function (resolve, reject) {
                    CommentModel.findOne({
                        _id: req.params.id
                    }, function (err, comment) {
                        if (err !== null) {
                            reject(err);
                        } else {
                            if (!comment) {
                                reject(new NotFoundError("Comment not found"));
                            } else {
                                resolve(comment);
                            }
                        }
                    })
                });
            })
            .then((comment) => {
                comment.content = validator.trim(data.content);
                comment.save();
                return comment;
            })
            .then((saved) => {
                callback.onSuccess(saved);
            })
            .catch((error) => {
                callback.onError(error);
            });
    }

    getSingleComment(req, callback) {
        let data = req.body;
        req.checkParams('id', 'Invalid comment id provided').isMongoId();
        req.getValidationResult()
            .then(function (result) {
                if (!result.isEmpty()) {
                    let errorMessages = result.array().map(function (elem) {
                        return elem.msg;
                    });
                    throw new ValidationError('There are validation errors: ' + errorMessages.join(' && '));
                }
                
                return new Promise(function (resolve, reject) {
                    CommentModel.findOne({
                        _id: req.params.id
                    }, function (err, comment) {
                        if (err !== null) {
                            reject(err);
                        } else {
                            if (!comment) {
                                reject(new NotFoundError("Comment not found"));
                            } else {
                                resolve(comment);
                            }
                        }
                    })
                });
            })
            .then((comment) => {
                console.log(comment.username);
                callback.onSuccess(comment);
            })
            .catch((error) => {
                callback.onError(error);
            });
    }

    getAllComments(req, callback) {
        let data = req.body;
        new Promise(function (resolve, reject) {
                CommentModel.find({}, function (err, comments) {
                    if (err !== null) {
                        reject(err);
                    } else {
                        resolve(comments);
                    }
                });
            })
            .then((comments) => {
                callback.onSuccess(comments);
            })
            .catch((error) => {
                callback.onError(error);
            });
    }
}

module.exports = CommentHandler;