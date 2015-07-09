var express = require('express');
var logger = require('morgan');
var router = express.Router();


/* GET home page. */
router.get('/r/:roomid', function(req, res, next) {
  res.render('index', { title: 'Express', roomid: req.params.roomid });
});

router.get('/error/camera', function(req, res, next) {
  res.render('errorcamera', { title: 'Express', roomid: req.params.roomid });
});

router.get('/logs', function(req, res) {
    var db = req.db;
    var collection = db.get('loghistory');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

router.post('/logs', function(req, res) {
    var db = req.db;
    var collection = db.get('loghistory');
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;
