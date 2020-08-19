const express = require('express');
const router = express.Router();
const path = require('path');
const mysql = require('mysql');
const multer = require("multer"); 
const fs = require("fs");
const mime = require("mime");
const bodyParser = require('body-parser');
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

/**
 * AWS Connection
 */
const AWS = require('aws-sdk');
const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
const region = 'kr-standard';
const access_key = '6DugS46P2bEqZmjM8lLm';
const secret_key = '4a8y9sDUVE71vFb4FL3qpndDeLSUC3PJdQsKkbND';

const S3 = new AWS.S3({
    endpoint: endpoint,
    region: region,
    credentials: {
        accessKeyId : access_key,
        secretAccessKey: secret_key
    }
});
const bucket_name = 'mitbucket';


/**
 * Multer
 */
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
      fs.mkdir('./uploads', function(err) {
            console.log('success mkdir');
            callback(null, './uploads');
      })
    },
    filename: function (req, file, callback) {
      callback(null,  Date.now() + "-" + file.originalname);
    }
});

var upload = multer({ storage: storage })

 /* 업로드 요청 처리 */
 router.get('/',function(req,res){
	res.sendFile(path.join(__dirname, '..', '..', 'views', 'file.html'));
});


 /* 업로드 요청 처리 */
router.route('/upload').post(upload.single('myFile'), function(req,res) {

    console.log('upload post');

    /* mysql에 파일 경로 저장*/
    var branch_id = 1;
    connection.query('INSERT INTO file (bid,addr) VALUES(?, ?)',[branch_id, req.file.path], function(err, rows) {
        if (err)
            console.log(err);
        else
            console.log('insert query success');        
    });
    
    console.log(__dirname);
    /* server에 파일 저장*/
    var file = fs.createReadStream(path.join(__dirname,'..','..', req.file.path)) ;
    var params = { 
        Bucket: bucket_name, 
        Key: req.file.path, 
        ACL: 'public-read', /* 권한: 도메인에 객체경로 URL 을 입력하여 접근 가능하게 설정 */ 
        Body: file 
    } ;


    /* S3 파일 저장*/
    S3.upload(params, function(err, data){ 
        if(err){ 
            console.log("err: ", err) 
        } 
        console.log('=====업로드 성공=======') 
        console.log("data: ", data) 
        
        

        var url = "http://101.101.217.147:8000/tag/"+bucket_name+"/"+req.file.path;
        //var url = "http://tag:8000/tag/"+bucket_name+"/"+req.file.path;
        console.log(url);
        request(url, function(err,response,body){
            if (!err && response.statusCode == 200)
            {
                console.log(body);
                console.log(JSON.parse(body).genre);
                
                connection.query('UPDATE file SET tag = ? where addr = ?',[JSON.parse(body).genre, req.file.path], function(err, rows) {
                    if (err)
                        console.log(err);
                    else
                        console.log('update query success');        
                });

            }
            else 
                console.log(err);
        });
        
        

    })

    
});


    
 /* 다운로드 요청 처리 */
 router.route('/download').post(function(req,res) {

    /**AWS File Download */
    var file_id = parseInt(req.body.file_id);
    var branch_id = parseInt(req.body.branch_id);

    var sql_1 = 'SELECT * FROM file where id = ? and bid = ?'
    var params_1 = [file_id, branch_id];

    connection.query(sql_1 ,params_1,function (err,rows) {
        if (err)
            console.log(err);

        else {
            console.log('success query 1');

            var origin_file_name = rows[0].addr.replace('uploads/','');
            var file = require('fs').createWriteStream(origin_file_name);

            var params = {
                Bucket: bucket_name,
                Key: rows[0].addr
            };
            S3.getObject(params).createReadStream().pipe(file);

            var filename = path.join(__dirname,'..','..', origin_file_name)
            //var filename = '/root/Music-Collaboration-Platform-Mit/file_management/app/' + origin_file_name;
            res.download(filename);
        }
    });

});
    
module.exports = router;
