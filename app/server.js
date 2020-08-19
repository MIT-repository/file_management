const express = require('express');
const bodyParser = require('body-parser');
const app = express();

/*
* Router 세팅
*/
const fileRouter = require('./routers/file');
const processRouter = require('./routers/process');

/*
* MiddleWare 세팅
*/
app.use('/static/',express.static(__dirname+'/views'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.get('/',function (req,res) {
    res.sendFile(__dirname+'/views/create_repo.html');
});


/*
 * Router 설정 
 */
app.use('/file',fileRouter);
app.use('/', processRouter);

/*
* Sever Test
*/
var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Server is working : PORT - ',port);
});
