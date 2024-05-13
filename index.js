var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('{ "response": "Hello there nuageup" }');
});

app.get('/liveness', function (req, res) {
    res.send('{ "response": "It alive !" }');
});
app.get('/readiness', function (req, res) {
    res.send('{ "response": " Get ready for some action!" }');
});
app.listen(process.env.PORT || 3000);
module.exports = app;
