const ThreadModel = require(APP_MODEL_PATH + 'thread').ThreadModel;
const CommentModel = require(APP_MODEL_PATH + 'comment').CommentModel;
const UserModel = require(APP_MODEL_PATH + 'user').UserModel;

after((done) => {
    CommentModel.remove({}, function(err) { 
        ThreadModel.remove({}, function(err) { 
            UserModel.remove({}, function(err) { 
                done();
            });
        });
    });
});