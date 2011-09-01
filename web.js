var express = require('express'),
    fs      = require('fs'),
    http    = require('http'),
    https   = require('https'),
    jsdom   = require('jsdom');

var app = express.createServer(express.logger());

app.use('/', express.static(__dirname + '/public/'));
app.use('/lib/', express.static(__dirname + '/lib/'));
app.use('/vendor/', express.static(__dirname + '/vendor/'));

var git = {
    head: function (branch, callback) {
        fs.readFile(['.git/refs/heads/', branch].join(''), function (err, data) {
            if (err) throw err;
            callback(String(data));
        });
    }
};

app.get('/cache.manifest', function (req, res) {
    var body = ['CACHE MANIFEST'];

    // res.contentType('text/cache-manifest'); // FIXME
    res.setHeader('Content-Type', 'text/cache-manifest');

    // Idea:
    // var manifest = {
    //     sections: {
    //         CACHE:   ['index.html']
    //         NETWORK: ['*']
    //     }
    // };

    git.head('master', function (sha) {
        body.push(['#', sha].join(' ')); 

        if ('production' !== process.env.NODE_ENV) {
            // NOTE timing dependency (requests must be within a second) -- probably okay for development
            body.push(['#', (new Date()).toString()].join(' ')); 
        }

        body.push('CACHE:'); 
        body.push('index.html');

        body.push('NETWORK:');
        body.push('*');

        res.write(body.join('\n'));

        res.end();
    });
});

app.get('/rubygems.json', function (request, response) {
    var options = {
            host: 'rubygems.org',
            path: ['/api/v1/versions/', request.query.gemName, '.json'].join('')
        };

    // TODO this doesn't give back an object that's compatible with http.get... why?
    // var opts = url.parse('http://rubygems.org/api/v1/versions/maid.json');

    http.get(options, function (apiResponse) {
        apiResponse.on('data', function (chunk) {
            response.write(chunk);
        }).on('end', function () {
            response.end();
        });
    });
});

// TODO parameterize
app.get('/chrome_web_store.json', function (request, response) {
    var buffer = [],
        options = {
            host: 'chrome.google.com',
            path: '/webstore/detail/ddldimidiliclngjipajmjjiakhbcohn'
        };

    // TODO switch to using jsdom (which currently gives "Error: Hierarchy request error", but only on these webstore URLs)
    https.get(options, function (extResponse) {
        extResponse.on('data', function (chunk) {
            buffer.push(chunk);
            // TODO maybe check on [last, chunk].join('').match...  faster?
        }).on('end', function () {
            var rawHTML = buffer.join(''),
                match   = rawHTML.match(/"detail-num-users">(\d+,?)+ users/),
                json = {path: options.path};

            if (match) json.detailNumUsers = Number(match[1]);
            
            response.send(json);
        });
    });
});

(function (port) {
    app.listen(port, function () {
        console.log("Listening on " + port);
    });
}(process.env.PORT || 3000));
