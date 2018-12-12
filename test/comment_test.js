const ThreadModel = require(APP_MODEL_PATH + 'thread').ThreadModel;
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const should = chai.should;
const expect = chai.expect

chai.use(chaiHttp);
describe('Comments API interface', () => {
    let user1 = {
        id: '',
        username: '1',
        name: {
            first: 'Patrick',
            middle: 'van',
            last: 'Batenbrug'
        },
        password: '123456',
        email: 'mail@gmail.com',
        token: ''
    }

    let user2 = {
        id: '',
        username: '2',
        name: {
            first: 'Patrick',
            middle: 'van',
            last: 'Batenbrug'
        },
        password: '123456',
        email: 'mail@gmail.com',
        token: ''
    }

    let thread = {
        id: '',
        title: 'A title',
        content: 'Some content'
    }

    let comment1 = {
        id: '',
        content: 'Comment 1'
    }

    let comment2 = {
        id: '',
        content: 'Comment 2'
    }

    before((done) => {
        ThreadModel.remove({}, function (err) {
            chai.request(app)
                .post('/v1/users')
                .set('Authorization', 'supersecretbulletproofkey')
                .send({
                    username: user1.username,
                    name: user1.name,
                    password: user1.password,
                    email: user1.email
                })
                .end((err, res) => {
                    chai.request(app)
                        .post('/v1/auth')
                        .set('Authorization', 'supersecretbulletproofkey')
                        .send({
                            username: user1.username,
                            password: user1.password
                        })
                        .end((err, res) => {
                            user1.id = res.body.data.id;
                            user1.token = res.body.data.token;

                            chai.request(app)
                                .post('/v1/users')
                                .set('Authorization', 'supersecretbulletproofkey')
                                .send({
                                    username: user2.username,
                                    name: user2.name,
                                    password: user2.password,
                                    email: user2.email
                                })
                                .end((err, res) => {
                                    chai.request(app)
                                        .post('/v1/auth')
                                        .set('Authorization', 'supersecretbulletproofkey')
                                        .send({
                                            username: user2.username,
                                            password: user2.password
                                        })
                                        .end((err, res) => {
                                            user2.id = res.body.data.id;
                                            user2.token = res.body.data.token;
                
                                            chai.request(app)
                                                .post('/v1/threads')
                                                .set('Authorization', `JWT ${user1.token}`)
                                                .send({
                                                    title: thread.title,
                                                    content: thread.content,
                                                    author: {
                                                        id: user1.id
                                                    }
                                                })
                                                .end((err, res) => {
                                                    thread.id = res.body.data.id;
                                                    done();
                                                });
                                        });
                                });
                        });
                });
        });
    });

    it('should POST /v1/comments/:id correct on a thread', done => {
        chai.request(app)
            .post(`/v1/comments/${thread.id}`)
            .set('Authorization', `JWT ${user1.token}`)
            .send({
                content: comment1.content,
                author: {
                    id: user1.id
                }
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('success').to.equal(true);
                expect(res.body).to.have.property('data').that.has.property('comments').to.have.length(1);
                comment1.id = res.body.data.comments[0];
                done();
            });
    });

    it('should POST /v1/comments/:id correct on a comment', done => {
        chai.request(app)
            .post(`/v1/comments/${comment1.id}`)
            .set('Authorization', `JWT ${user1.token}`)
            .send({
                content: comment2.content,
                author: {
                    id: user2.id
                }
            })
            .end((err, res) => {                
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('success').to.equal(true);
                expect(res.body).to.have.property('data').that.has.property('comments').to.have.length(1);
                comment2.id = res.body.data.comments[0].id;
                done();
            });
    });

    it('should POST /v1/comments/:id incorrect if params missing', done => {
        chai.request(app)
            .post(`/v1/comments/${comment1.id}`)
            .set('Authorization', `JWT ${user1.token}`)
            .send({
                author: {
                    id: user1.id
                }
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('success').to.equal(false);
                expect(res.body).to.have.property('message').to.equal('There are validation errors: Invalid comment content && Comment content must be between 1 and 3000 chars long');
                done();
            });
    });

    it('should POST /v1/comments/:id incorrect if JWT malformed', done => {
        chai.request(app)
            .post(`/v1/comments/${comment1.id}`)
            .set('Authorization', `JWT 123`)
            .send({
                content: comment2.content,
                author: {
                    id: user1.id
                }
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('success').to.equal(false);
                expect(res.body).to.have.property('message').to.equal('jwt malformed');
                done();
            });
    });

    it('should POST /comments incorrect', done => {
        chai.request(app)
            .post(`/v1/comments`)
            .set('Authorization', `JWT ${user1.token}`)
            .send({
                author: {
                    id: user1.id
                }
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                done();
            });
    });

    it('should GET /v1/comments correct', done => {
        chai.request(app)
            .get('/v1/comments')
            .set('Authorization', `JWT ${user1.token}`)
            .end((err, res) => {
                chai.request(app)
                    .get(`/v1/threads`)
                    .set('Authorization', `JWT ${user1.token}`)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.have.property('success').to.equal(true);
                        expect(res.body).to.have.property('data').to.have.length(1);
                        done();
                    });
            });
    });

    it('should GET /v1/comments incorrect if JWT malformed', done => {
        chai.request(app)
            .post('/v1/comments')
            .set('Authorization', `JWT ${user1.token}`)
            .end((err, res) => {
                chai.request(app)
                    .get(`/v1/comments`)
                    .set('Authorization', `JWT 123`)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(401);
                        expect(res.body).to.have.property('success').to.equal(false);
                        expect(res.body).to.have.property('message').to.equal('jwt malformed');        
                        done();
                    });
            });
    });

    it('should GET /v1/comments/:id correct', done => {
        chai.request(app)
            .get(`/v1/comments/${comment2.id}`)
            .set('Authorization', `JWT ${user2.token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('success').to.equal(true);
                expect(res.body).to.have.property('data').that.has.property('content').to.equal(comment2.content);
                expect(res.body).to.have.property('data').that.has.property('author').that.has.property('id').to.equal(user2.id);
                expect(res.body).to.have.property('data').that.has.property('date');
                expect(res.body).to.have.property('data').that.has.property('id');
                done();
            });
    });

    it('should GET /v1/comments/:id incorrect if JWT malformed', done => {
        chai.request(app)
            .get(`/v1/comments/${comment2.id}`)
            .set('Authorization', `JWT 123`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('success').to.equal(false);
                expect(res.body).to.have.property('message').to.equal('jwt malformed');        
                done();
            });
    });

    it('should GET /v1/comments/:id incorrect if not found', done => {
        chai.request(app)
            .get(`/v1/comments/${mongoose.Types.ObjectId()}`)
            .set('Authorization', `JWT ${user1.token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('success').to.equal(false);
                expect(res.body).to.have.property('message').to.equal('Comment not found');
                done();
            });
    });

    it('should PUT /v1/comments/:id correct', done => {
        comment2.content = 'Some updated content';
        chai.request(app)
            .put(`/v1/comments/${comment2.id}`)
            .set('Authorization', `JWT ${user2.token}`)
            .send({
                content: comment2.content,
                author: {
                    id: user2.id
                }
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('success').to.equal(true);
                expect(res.body).to.have.property('data').that.has.property('content').to.equal(comment2.content);
                expect(res.body).to.have.property('data').that.has.property('author').that.has.property('id').to.equal(user2.id);
                expect(res.body).to.have.property('data').that.has.property('date');
                expect(res.body).to.have.property('data').that.has.property('id');
                done();
            });
    });

    it('should PUT /v1/comments incorrect if JWT malformed', done => {
        chai.request(app)
            .put(`/v1/comments/${comment2.id}`)
            .set('Authorization', `JWT 123`)
            .send({
                content: 'Some newer content',
                author: {
                    id: user2.id
                }
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('success').to.equal(false);
                expect(res.body).to.have.property('message').to.equal('jwt malformed');        
                done();
            });
    });

    it('should PUT /v1/comments incorrect if params missing', done => {
        chai.request(app)
            .put(`/v1/comments/${comment2.id}`)
            .set('Authorization', `JWT ${user2.token}`)
            .send({
                author: {
                    id: user1.id
                }
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('success').to.equal(false, );
                expect(res.body).to.have.property('message').to.equal('There are validation errors: Invalid comment content && Comment content must be between 1 and 3000 chars long');
                done();
            });
    });

    it('should PUT /v1/comments incorrect if comment not found for user', done => {
        chai.request(app)
            .put(`/v1/comments/${comment1.id}`)
            .set('Authorization', `JWT ${user2.token}`)
            .send({
                content: 'Not my comment',
                author: {
                    id: user2.id
                }
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('success').to.equal(false, );
                expect(res.body).to.have.property('message').to.equal('Comment not found');
                done();
            });
    });

    it('should DELETE /v1/comments incorrect if JWT malformed', done => {
        chai.request(app)
            .delete(`/v1/comments/${comment2.id}/${user2.id}`)
            .set('Authorization', `JWT 123`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('success').to.equal(false);
                expect(res.body).to.have.property('message').to.equal('jwt malformed');        
                done();
            });
    });

    it('should DELETE /v1/comments incorrect if params missing', done => {
        chai.request(app)
            .delete(`/v1/comments/${comment1.id}`)
            .set('Authorization', `JWT ${user1.token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                done();
            });
    });

    it('should DELETE /v1/comments incorrect if comment not found for user', done => {
        chai.request(app)
            .delete(`/v1/comments/${comment1.id}/${user2.id}`)
            .set('Authorization', `JWT ${user2.token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message').to.equal('Comment not found');
                done();
            });
    });

    it('should DELETE /v1/comments correct', done => {
        chai.request(app)
            .delete(`/v1/comments/${comment2.id}/${user2.id}`)
            .set('Authorization', `JWT ${user2.token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('success').to.equal(true);
                expect(res.body).to.have.property('data').that.has.property('content').to.equal('[Deleted]');
                expect(res.body).to.have.property('data').that.has.property('author').that.has.property('username').to.equal('[Deleted]');
                expect(res.body).to.have.property('data').that.has.property('date');
                expect(res.body).to.have.property('data').that.has.property('id');
                done();
            });
    });
});