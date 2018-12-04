const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let ThreadSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required.']
    },
    content: {
        type: String,
        required: [true, 'Content is required.']
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
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
});

ThreadSchema.pre('update', function (next, done) {
    this.dateModified = Date.now();
    next();
});

ThreadSchema.pre('save', function (next, done) {
    this.dateModified = Date.now();
    next();
});

ThreadSchema.methods.toJSON = function () {
    let obj = this.toObject();
    delete obj.__v;
    return obj
};

module.exports.ThreadModel = mongoose.model('Thread', ThreadSchema);