var mysql = require('mysql');

module.exports = function () {
    return {
      init: function () {
        return mysql.createConnection({
            host: '49.50.161.221',
            port: '3306',
            user: 'mit',
            password: 'mit',
            database: 'mit_db'
        })
      },
      
      test_open: function (con) {
        con.connect(function (err) {
          if (err) {
            console.error('mysql connection error :' + err);
          } else {
            console.info('mysql is connected successfully.');
          }
        })
      }
    }
};

