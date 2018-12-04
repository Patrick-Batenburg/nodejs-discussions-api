const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let schemaOptions = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
};

const CommentSchema = new Schema({
    content: {
        type: String,
        required: [true, 'Content is required.'],
    },
    authorId: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    dateModified: {
        type: Date,
        default: Date.now
    },
    comments: [{
        type: ObjectId,
        ref: 'Comment'
    }]
}, schemaOptions);

CommentSchema.pre('update', function (next, done) {
    this.dateModified = Date.now();
    next();
});

CommentSchema.pre('save', function (next, done) {
    this.dateModified = Date.now();
    next();
});

CommentSchema.methods.toJSON = function () {
    let obj = this.toObject();
    delete obj.__v;
    return obj
};

module.exports.CommentModel = mongoose.model('Comment', CommentSchema);