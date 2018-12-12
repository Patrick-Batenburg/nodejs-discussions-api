const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const should = chai.should;
const expect = chai.expect

chai.use(chaiHttp);
describe('Auth API interface', () => {
    let username = '1' + Math.floor((Math.random() * 1000000000000) + 1);
    let name = {
        first: 'Patrick',
        middle: 'van',
        last: 'Batenbrug'
    };
    let password = '123456';
    let email = 'mail@gmail.com';

    before((done) => {
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
                done();
            });
    });

    it('should POST /v1/auth correct', done => {
        chai.request(app)
            .post('/v1/auth')
            .set('Authorization', 'supersecretbulletproofkey')
            .send({
                username,
                password
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('success').to.equal(true);
                expect(res.body).to.have.property('data').that.has.property('id');
                expect(res.body).to.have.property('data').that.has.property('username').to.equal(username);
                expect(res.body).to.have.property('data').that.has.property('token');
                done();
            });
    });

    it('should POST /v1/auth incorrect if invalid credentials', done => {
        chai.request(app)
            .post('/v1/auth')
            .set('Authorization', 'supersecretbulletproofkey')
            .send({
                username,
                password: password + "a"
            })
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('success').to.equal(false);
                expect(res.body).to.have.property('message').to.equal("Invalid credentials");
                done();
            });
    });
});