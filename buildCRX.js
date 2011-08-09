var fs   = require('fs'),
    util = require('util');

var outputPath = './build/crx/';

// I'm surprised at how hard interacting with the filesystem is... I gave up and started on build-crx.sh until I figure out what I want to do.
fs.stat(outputPath, function (err) {
    if (!err) { fs.rmdirSync(outputPath); }

    fs.mkdir(outputPath, 0777, function () {
        var newFile = fs.createWriteStream([outputPath, 'manifest.json'].join('')),
            oldFile = fs.createReadStream('./crx/manifest.json');

        newFile.once('open', function () { util.pump(oldFile, newFile) });
    });
});
