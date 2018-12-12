const UserModel = require(APP_MODEL_PATH + 'user').UserModel;
const AlreadyExistsError = require(APP_ERROR_PATH + 'already-exists');
const ValidationError = require(APP_ERROR_PATH + 'validation');
const UnauthorizedError = require(APP_ERROR_PATH + 'unauthorized');

class UserHandler {
    constructor() {
        this._validator = require('validator');
    }

    static get USER_VALIDATION_SCHEME() {
        return {
            'username': {
                notEmpty: true,
                isLength: {
                    options: [{
                        min: 1,
                        max: 15
                    }],
                    errorMessage: 'Username must be between 1 and 15 chars long'
                },
                errorMessage: 'Invalid First Name'
            },
            'name.first': {
                notEmpty: true,
                isLength: {
                    options: [{
                        min: 1,
                        max: 15
                    }],
                    errorMessage: 'First Name must be between 1 and 15 chars long'
                },
                errorMessage: 'Invalid First Name'
            },
            'name.last': {
                notEmpty: true,
                isLength: {
                    options: [{
                        min: 1,
                        max: 15
                    }],
                    errorMessage: 'Last Name must be between 1 and 15 chars long'
                },
                errorMessage: 'Invalid Last Name'
            },
            'email': {
                isEmail: {
                    errorMessage: 'Invalid Email'
                },
                errorMessage: "Invalid email provided"
            },
            'password': {
                notEmpty: true,
                isLength: {
                    options: [{
                        min: 6,
                        max: 35
                    }],
                    errorMessage: 'Password must be between 6 and 35 chars long'
                },
                errorMessage: 'Invalid Password Format'
            }

        };
    }

    getUserInfo(req, userToken, callback) {
        req.checkParams('id', 'Invalid user id provided').isMongoId();
        req.getValidationResult()
            .then((result) => {
                if (!result.isEmpty()) {
                    let errorMessages = result.array().map(function (elem) {
                        return elem.msg;
                    });

                    throw new ValidationError('There have been validation errors: ' + errorMessages.join(' && '));
                }

                let userId = req.params.id;

                if (userToken.id !== req.params.id) {
                    throw new UnauthorizedError("Provided id doesn't match with  the requested user id")
                } else {
                    return new Promise(function (resolve, reject) {
                        UserModel.findById(userId, function (err, user) {
                            if (user === null) {

                            } else {
                                resolve(user);
                            }
                        });
                    });
                }
            })
            .then((user) => {
                callback.onSuccess(user);
            })
            .catch((error) => {
                callback.onError(error);
            });
    }

    createNewUser(req, callback) {
        let data = req.body;
        let validator = this._validator;
        //req.checkBody(UserHandler.USER_VALIDATION_SCHEME);        
        req.getValidationResult()
            .then(function (result) {
                if (!result.isEmpty()) {
                    let errorMessages = result.array().map(function (elem) {
                        return elem.msg;
                    });

                    throw new ValidationError('There are validation errors: ' + errorMessages.join(' && '));
                }

                return new UserModel({
                    username: validator.trim(data.username),
                    name: {
                        first: validator.trim(data.name.first),
                        middle: validator.trim(data.name.middle),
                        last: validator.trim(data.name.last),
                    },
                    email: validator.trim(data.email),
                    password: validator.trim(data.password)
                });
            })
            .then((user) => {
                return new Promise(function (resolve, reject) {
                    UserModel.find({
                        username: user.username
                    }, function (err, docs) {
                        if (docs.length) {
                            reject(new AlreadyExistsError("User already exists"));
                        } else {
                            resolve(user);
                        }
                    });
                });
            })
            .then((user) => {
                user.save();
                return user;
            })
            .then((saved) => {
                callback.onSuccess(saved);
            })
            .catch((error) => {
                callback.onError(error);
            });
    }
}

module.exports = UserHandler;