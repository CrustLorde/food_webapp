const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'yourUsername',
    password: 'yourPassword',
    database: 'southernFishHouseDB'
});

connection.connect(error => {
    if (error) throw error;
    console.log('Successfully connected to the database.');
});

module.exports = connection;
