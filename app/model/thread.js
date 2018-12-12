const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const CommentModel = require(APP_MODEL_PATH + 'comment').CommentModel;

let schemaOptions = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
};

let ThreadSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required.']
    },
    content: {
        type: String,
        required: [true, 'Content is required.']
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
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        $cascadeDelete: true
    }]
}, schemaOptions);

ThreadSchema.virtual('id').get(function () {
    return this._id;
});

ThreadSchema.pre('save', function (next) {
    if (!this.isNew) {
        this.date.modified = Date.now();
    }

    next();
});

ThreadSchema.pre('remove', function(next){

    next();
});

ThreadSchema.pre('remove', function(next) { 
    this.comments.forEach(function(comment) {
        mongoose.models["Comment"].findOneAndRemove({ _id: comment }, function(err, found) {
            if(found) {
                found.remove();
            }
        });
    });

    next();
});

ThreadSchema.methods.toJSON = function () {
    let obj = this.toObject();
    delete obj.__v;
    delete obj._id;
    return obj
};

module.exports.ThreadModel = mongoose.model('Thread', ThreadSchema);