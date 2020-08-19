const express = require('express');
const router = express.Router();
const path = require('path');
const mysql = require('mysql');
const fs = require('fs');
const moment = require('moment');
const request = require('request');

/*
* Database Connection 
*/

var connection = mysql.createConnection({
    host: '49.50.161.221',
    port: '3306',
    user: 'root',
    password: 'mit',
    database: 'mit_db'
});

router.route('/:userid/:repoid/:status/:score/:tag').get(function(req,res){
    console.log('success');
    console.log(req);
       
    connection.connect();

    //console.log(req.params.repoid);
    
    
    var repo_created_at = moment().format('YYYY-MM-DD HH:mm:ss');
    //var repo_user_id = 111111;

    var repo_user_id = req.params.userid;
    var repo_title = req.params.repoid;
    var repo_status = req.params.status;
    var repo_score = req.params.score;
    var tag = req.params.tag;

   /*
    var repo_title = req.body.repository_name;
    var repo_status = req.body.repository_status;
    var repo_score = req.body.repository_score;
    var tag = req.body.repository_tag;
*/
    console.log(repo_status+"   " + repo_score+ "    " + tag);
    /*
    * SQL1
    */
    var sql_1 = 'INSERT INTO repository (title, created_at, status, score, tag, uid) VALUES(?, ?, ?, ?, ?, ?)'
    var params_1 = [repo_title, repo_created_at, repo_status, repo_score, tag, repo_user_id];
    
    connection.query(sql_1, params_1, function(err, rows){
        if(err){
            console.log(err);
        } else {
            console.log('success query 1');

        }
    });


    /*
    * SQL2
    */
    var sql_2 = 'SELECT * FROM repository WHERE title = ? and uid = ?';
    var params_2 = [repo_title, repo_user_id];

    connection.query(sql_2, params_2, function (err,rows){
        if(err){
            console.log(err);
        } else {
            console.log('success query 2');
            var repo_id = rows[0].id;

            var sql_3 = 'INSERT INTO contributor (uid, rid) VALUES(?, ?)';
            var params_3 = [repo_user_id, repo_id];

            connection.query(sql_3, params_3, function (err,rows){
                if(err){
                    console.log(err);
                } else {
                    console.log('success query 3');
                }
            });


            var sql_4 = 'INSERT INTO branch(creator,rid,pid,branch_name,message,create_at) VALUES (?,?,?,?,?,?)';
            var params_4 = [repo_user_id, repo_id,repo_id, 'master', ,repo_created_at];

            connection.query(sql_4, params_4, function(err,rows){
                if (err)
                    console.log (err);
                else   
                    console.log('success query 4');
            })
            connection.end();

        }

    });

    res.sendFile(path.join(__dirname, '..', 'views', 'create_branch.html'));
});


router.route('/:branch_name/:branch_creator/:branch_rid/:branch_pid/:branch_message').get(function(req,res){
    
    connection.connect();

    var branch_name = req.params.branch_name;
    var branch_creator = req.params.branch_creator;
    var branch_create_at = moment().format('YYYY-MM-DD HH:mm:ss');
    var branch_rid = req.params.branch_rid;
    var branch_pid = req.params.branch_pid;
    var branch_message = req.params.branch_message;

    /*
    * SQL1
    */
    var sql_1 = 'INSERT INTO branch (creator, rid, pid, branch_name, message, create_at) VALUES(?, ?, ?, ?, ?, ?)'
    var params_1 = [branch_creator, branch_rid, branch_pid,  branch_name,  branch_message, branch_create_at];
    
    connection.query(sql_1, params_1, function(err, rows){
        if(err){
            console.log(err);
        } else {
            console.log('success query 1');

        }
    });

    connection.end();

    res.sendFile(path.join(__dirname, '..', 'views', 'file.html'));

});

router.route('/register').get(function(req,res) {
    res.sendFile(path.join(__dirname,'..', 'views', 'file.html'));
});


module.exports = router;
