var request = require('supertest');
var app = require('../index.js');
describe('GET /liveness', function() {
    it('respond with It alive !', function(done) {
        request(app).get('/liveness').expect('{ "response": "It alive !" }', done);
    });
});