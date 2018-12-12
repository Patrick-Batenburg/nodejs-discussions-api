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
    author: { 
        id: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String
        }
     },
    date: {
        created: {
            type: Date,
            default: Date.now
        },
        modified: {
            type: Date,
            default: Date.now
        }
    },
    comments: [{
        type: ObjectId,
        ref: 'Comment',
        autopopulate: true
    }]
}, schemaOptions);

CommentSchema.plugin(require('mongoose-autopopulate'));

CommentSchema.virtual('id').get(function () {
    return this._id;
});

CommentSchema.pre('save', function (next) {
    if (!this.isNew) {
        this.date.modified = Date.now();
    }

    next();
});

CommentSchema.pre('remove', function(next) { 
    this.comments.forEach(function(comment) {
        mongoose.models["Comment"].findOneAndRemove({ _id: comment }, function(err, found) {
            if(found) {
                found.remove();
            }
        });
    });

    next();
});

CommentSchema.methods.toJSON = function () {
    let obj = this.toObject();
    delete obj.__v;
    delete obj._id;
    return obj
};

module.exports.CommentModel = mongoose.model('Comment', CommentSchema);