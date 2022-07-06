//var mysql = require('mysql');
const mysql = require('mysql2');

var pool = mysql.createPool({
    host: 'sql11.freesqldatabase.com',
    port: '3306',
    user: 'sql11504510',
    password: 'mmynGX3hue',
    database: 'sql11504510',
    connectionLimit: 1000,
    debug: false,
    waitForConnections: true,
    queueLimit: 0
});

var getConnection = (function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
});

module.exports = getConnection;

// con.connect(function(err) {
//     //console.log('tests ide se na proveru greške 2');
//     if (err) {
//       //console.log('greška: ' + err);
//       throw err;
//     }
// });

//module.exports = pool;