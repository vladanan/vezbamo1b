//var mysql = require('mysql');
const mysql = require('mysql2');

// var con = mysql.createConnection({
//     host: '127.0.0.1',
//     port: '3306',
//     user: 'root',
//     password: 'vezbamo',
//     database: "vezbamo"
// });

/*
https://www.freesqldatabase.com
freesqldatabase.com <support@freesqldatabase.com>
To:vladan_zasve@yahoo.com
Wed, Jul 6 at 8:53 PM

Hi

Your account number is: 633173

Your new database is now ready to use.

To connect to your database use these details;

Host: sql11.freesqldatabase.com
Database name: sql11504510
Database user: sql11504510
Database password: mmynGX3hue
Port number: 3306
*/

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

/*
var pool = mysql.createPool({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'vezbamo',
    database: 'vezbamo_programiramo',
    connectionLimit: 1000,
    debug: false,
    waitForConnections: true,
    queueLimit: 0
});
*/


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

//console.log('U BAAAAAAAAZIIIIIII SAAAAAAAM');

//module.exports = pool;