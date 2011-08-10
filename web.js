var express = require('express'),
    http    = require('http');

var app = express.createServer(express.logger());

app.use('/', express.static(__dirname + '/public/'));
app.use('/lib/', express.static(__dirname + '/lib/'));
app.use('/vendor/', express.static(__dirname + '/vendor/'));

app.get('/rubygems.json', function (request, response) {
    var buffer = [],
        options = {
            host: 'rubygems.org',
            path: ['/api/v1/versions/', request.query.gemName, '.json'].join('')
        };

    // TODO this doesn't give back an object that's compatible with http.get... why?
    // var opts = url.parse('http://rubygems.org/api/v1/versions/maid.json');

    http.get(options, function (apiResponse) {
        apiResponse.on('data', function (chunk) {
            buffer.push(chunk);
        }).on('end', function () {
            response.send(buffer.join(''));
        });
    }).on('error', function (e) {
        throw e;
    });
});

(function (port) {
    app.listen(port, function () {
        console.log("Listening on " + port);
    });
}(process.env.PORT || 3000));
