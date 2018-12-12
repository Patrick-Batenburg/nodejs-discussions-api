const ThreadModel = require(APP_MODEL_PATH + 'thread').ThreadModel;
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const should = chai.should;
const expect = chai.expect

chai.use(chaiHttp);
describe('Threads API interface', () => {
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

    let threadId;
    let title = 'A title'
    let content = 'Some content';

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
                                            done();
                                        });
                                });
                        });
                });
        });
    });

    it('should POST /v1/threads correct', done => {
        chai.request(app)
            .post('/v1/threads')
            .set('Authorization', `JWT ${user1.token}`)
            .send({
                title,
                content,
                author: {
                    id: user1.id
                }
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('success').to.equal(true);
                expect(res.body).to.have.property('data').that.has.property('title').to.equal(title);
                expect(res.body).to.have.property('data').that.has.property('content').to.equal(content);
                expect(res.body).to.have.property('data').that.has.property('author').that.has.property('id').to.equal(user1.id);
                expect(res.body).to.have.property('data').that.has.property('date');
                expect(res.body).to.have.property('data').that.has.property('id');
                threadId = res.body.data.id;
                done();
            });
    });

    it('should POST /v1/threads incorrect if params missing', done => {
        chai.request(app)
            .post('/v1/threads')
            .set('Authorization', `JWT ${user1.token}`)
            .send({
                content,
                author: {
                    id: user1.id
                }
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('success').to.equal(false);
                expect(res.body).to.have.property('message').to.equal('There are validation errors: Invalid thread title && Thread title must be between 1 and 150 chars long');
                done();
            });
    });

    it('should POST /v1/threads incorrect if JWT malformed', done => {
        chai.request(app)
            .post('/v1/threads')
            .set('Authorization', `JWT 123`)
            .send({
                content,
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

    it('should GET /v1/threads correct', done => {
        chai.request(app)
            .post('/v1/threads')
            .set('Authorization', `JWT ${user1.token}`)
            .send({
                title,
                content,
                author: {
                    id: user1.id
                }
            })
            .end((err, res) => {
                chai.request(app)
                    .get(`/v1/threads`)
                    .set('Authorization', `JWT ${user1.token}`)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.have.property('success').to.equal(true);
                        expect(res.body).to.have.property('data').to.have.length(2);
                        done();
                    });
            });
    });

    it('should GET /v1/threads incorrect if JWT malformed', done => {
        chai.request(app)
            .post('/v1/threads')
            .set('Authorization', `JWT ${user1.token}`)
            .send({
                title,
                content,
                author: {
                    id: user1.id
                }
            })
            .end((err, res) => {
                chai.request(app)
                    .get(`/v1/threads`)
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

    it('should GET /v1/threads/:id correct', done => {
        chai.request(app)
            .get(`/v1/threads/${threadId}`)
            .set('Authorization', `JWT ${user1.token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('success').to.equal(true);
                expect(res.body).to.have.property('data').that.has.property('title').to.equal(title);
                expect(res.body).to.have.property('data').that.has.property('content').to.equal(content);
                expect(res.body).to.have.property('data').that.has.property('author').that.has.property('id').to.equal(user1.id);
                expect(res.body).to.have.property('data').that.has.property('date');
                expect(res.body).to.have.property('data').that.has.property('id');
                done();
            });
    });

    it('should GET /v1/threads/:id incorrect if JWT malformed', done => {
        chai.request(app)
            .get(`/v1/threads/${threadId}`)
            .set('Authorization', `JWT ${user1.token}`)
            .set('Authorization', `JWT 123`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('success').to.equal(false);
                expect(res.body).to.have.property('message').to.equal('jwt malformed');
                done();
            });
    });

    it('should GET /v1/threads/:id incorrect if not found', done => {
        chai.request(app)
            .get(`/v1/threads/${mongoose.Types.ObjectId()}`)
            .set('Authorization', `JWT ${user1.token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('success').to.equal(false);
                expect(res.body).to.have.property('message').to.equal('Thread not found');
                done();
            });
    });

    it('should PUT /v1/threads correct', done => {
        content = 'Some new content';
        chai.request(app)
            .put(`/v1/threads/${threadId}`)
            .set('Authorization', `JWT ${user1.token}`)
            .send({
                title: 'A new title',
                content: content,
                author: {
                    id: user1.id
                }
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('success').to.equal(true);
                expect(res.body).to.have.property('data').that.has.property('title').to.equal(title);
                expect(res.body).to.have.property('data').that.has.property('content').to.equal(content);
                expect(res.body).to.have.property('data').that.has.property('author').that.has.property('id').to.equal(user1.id);
                expect(res.body).to.have.property('data').that.has.property('date');
                expect(res.body).to.have.property('data').that.has.property('id');
                done();
            });
    });

    it('should PUT /v1/threads incorrect if JWT malformed', done => {
        chai.request(app)
            .put(`/v1/threads/${threadId}`)
            .set('Authorization', `JWT 123`)
            .send({
                title: 'A new title',
                content: 'Some newer content',
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

    it('should PUT /v1/threads incorrect if params missing', done => {
        chai.request(app)
            .put(`/v1/threads/${threadId}`)
            .set('Authorization', `JWT ${user1.token}`)
            .send({
                title: 'A new title',
                author: {
                    id: user1.id
                }
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('success').to.equal(false, );
                expect(res.body).to.have.property('message').to.equal('There are validation errors: Invalid thread content && Thread content must be between 1 and 3000 chars long');
                done();
            });
    });

    it('should PUT /v1/threads incorrect if thread not found for user', done => {
        chai.request(app)
            .put(`/v1/threads/${threadId}`)
            .set('Authorization', `JWT ${user1.token}`)
            .send({
                title: 'A new title',
                content: 'Not my thread',
                author: {
                    id: user2.id
                }
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('success').to.equal(false, );
                expect(res.body).to.have.property('message').to.equal('Thread not found');
                done();
            });
    });

    it('should DELETE /v1/threads incorrect if JWT malformed', done => {
        chai.request(app)
            .delete(`/v1/threads/${threadId}/${user1.id}`)
            .set('Authorization', `JWT 123`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('success').to.equal(false);
                expect(res.body).to.have.property('message').to.equal('jwt malformed');
                done();
            });
    });

    it('should DELETE /v1/threads incorrect if params missing', done => {
        chai.request(app)
            .delete(`/v1/threads/${threadId}`)
            .set('Authorization', `JWT ${user1.token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                done();
            });
    });

    it('should DELETE /v1/threads incorrect if thread not found for user', done => {
        chai.request(app)
            .delete(`/v1/threads/${threadId}/${user2.id}`)
            .set('Authorization', `JWT ${user1.token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message').to.equal('Thread not found');
                done();
            });
    });

    it('should DELETE /v1/threads correct', done => {
        chai.request(app)
            .post(`/v1/comments/${threadId}`)
            .set('Authorization', `JWT ${user1.token}`)
            .send({
                content: comment1.content,
                author: {
                    id: user1.id
                }
            })
            .end((err, res) => {
                comment1.id = res.body.data.comments[0];

                chai.request(app)
                    .post(`/v1/comments/${comment1.id}`)
                    .set('Authorization', `JWT ${user1.token}`)
                    .send({
                        content: comment2.content,
                        author: {
                            id: user1.id
                        }
                    })
                    .end((err, res) => {
                        comment2.id = res.body.data.comments[0].id;
                        chai.request(app)
                            .delete(`/v1/threads/${threadId}/${user1.id}`)
                            .set('Authorization', `JWT ${user1.token}`)
                            .end((err, res) => {
                                expect(err).to.be.null;
                                expect(res).to.have.status(200);
                                expect(res.body).to.have.property('success').to.equal(true);
                                expect(res.body).to.have.property('data').that.has.property('title').to.equal(title);
                                expect(res.body).to.have.property('data').that.has.property('content').to.equal(content);
                                expect(res.body).to.have.property('data').that.has.property('author').that.has.property('id').to.equal(user1.id);
                                expect(res.body).to.have.property('data').that.has.property('date');
                                expect(res.body).to.have.property('data').that.has.property('id');

                                chai.request(app)
                                    .get(`/v1/comments/${comment2.id}`)
                                    .set('Authorization', `JWT ${user1.token}`)
                                    .end((err, res) => {
                                        expect(err).to.be.null;
                                        expect(res).to.have.status(404);
                                        expect(res.body).to.have.property('success').to.equal(false);
                                        expect(res.body).to.have.property('message').to.equal('Comment not found');  
                                        done();
                                    });
                            });
                    });
            });
    });
});