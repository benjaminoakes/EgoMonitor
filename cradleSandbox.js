var cradle = require('cradle');

var db = new(cradle.Connection)().database('amzvaluation');

db.get('1ffdac6c475aa98ebcce91ad0e000465', function (err, doc) {
    console.dir(doc);
});

db.view('amzvaluation/clean', function (err, rows) {
    rows.forEach(function (row) {
        console.dir(row);
    });
});

// db.view('amzvaluation/totalSum', function (rows) {
//     rows.forEach(function (row) {
//         console.dir(row);
//     };
// });
