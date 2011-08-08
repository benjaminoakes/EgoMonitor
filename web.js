var express = require('express'),
    app = express.createServer(express.logger());

app.use('/', express.static(__dirname + '/public/'));
app.use('/vendor/', express.static(__dirname + '/vendor/'));

(function (port) {
    app.listen(port, function () {
        console.log("Listening on " + port);
    });
}(process.env.PORT || 3000));
