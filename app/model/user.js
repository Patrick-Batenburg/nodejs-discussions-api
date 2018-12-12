let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const crypto = require('crypto');

let schemaOptions = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
};

let UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        first: String,
        middle: String,
        last: String
    },
    salt: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    email: String,
    hashedPassword: {
        type: String,
        required: true
    },
}, schemaOptions);

UserSchema.virtual('id').get(function () {
    return this._id;
});

UserSchema.methods.toJSON = function () {
    let obj = this.toObject();
    delete obj.hashedPassword;
    delete obj.__v;
    delete obj._id;
    delete obj.salt;
    return obj
};

UserSchema.virtual('name.full').get(function () {
    let fullName = this.name.first + ' ';

    if (this.name.middle) {
        fullName += this.name.middle + ' ';
    }

    fullName += this.name.last;

    return fullName;
});

UserSchema.virtual('password')
    .set(function (password) {
        this.salt = crypto.randomBytes(32).toString('base64');
        this.hashedPassword = this.encryptPassword(password, this.salt);
    })
    .get(function () {
        return this.hashedPassword;
    });

UserSchema.methods.encryptPassword = function (password, salt) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
};

UserSchema.methods.checkPassword = function (password) {
    return this.encryptPassword(password, this.salt) === this.hashedPassword;
};

module.exports.UserModel = mongoose.model('User', UserSchema);