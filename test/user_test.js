const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const should = chai.should;
const expect = chai.expect

chai.use(chaiHttp);
describe('Users API interface', () => {
    let username = '1';
    let name = {
        first: 'Patrick',
        middle: 'van',
        last: 'Batenbrug'
    };
    let password = '123456';
    let email = 'mail@gmail.com';

    it('should POST /v1/users correct', done => {
        chai.request(app)
            .post('/v1/users')
            .set('Authorization', 'supersecretbulletproofkey')
            .send({
                username,
                name,
                password,
                email
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('success').to.equal(true);
                expect(res.body).to.have.property('data').that.has.property('username').to.equal(username);
                expect(res.body).to.have.property('data').that.has.property('email').to.equal(email);
                expect(res.body).to.have.property('data').that.has.property('name').that.has.property('first').to.equal(name.first);
                expect(res.body).to.have.property('data').that.has.property('name').that.has.property('middle').to.equal(name.middle);
                expect(res.body).to.have.property('data').that.has.property('name').that.has.property('last').to.equal(name.last);
                done();
            });
    });

    it('should POST /v1/users incorrect if user already exists', done => {
        chai.request(app)
            .post('/v1/users')
            .set('Authorization', 'supersecretbulletproofkey')
            .send({
                username,
                name,
                password,
                email
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(409);
                expect(res.body).to.have.property('success').to.equal(false);
                expect(res.body).to.have.property('message').to.equal('User already exists');
                done();
            });
    });

    it('should POST /v1/users incorrect if params missing', done => {
        chai.request(app)
            .post('/v1/users')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body).to.have.property('success').to.equal(false);
                expect(res).to.have.status(400);
                done();
            });
    });
});