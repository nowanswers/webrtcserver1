module.exports = function(rmsrv) {
	//console.log('roomapp created with rommserver: ' + roomserver.tag);

	var self = this;
	var roomserver = rmsrv;
	var express = require('express');

	var app = express();

	app.get('/rooms', function(req,res){
		//console.log('rooms: ' + JSON.stringify(roomserver.nspio.adapter.rooms));
		var roomsnum = Object.keys(roomserver.nspio.adapter.rooms).length ;
      	res.json({num: roomsnum, rooms: roomserver.nspio.adapter.rooms});// clients );
	});

	app.get('/room/:roomid', function(req,res){
		var rooms = roomserver.nspio.adapter.rooms;
		var roomid =req.params.roomid;
		var peers = rooms[roomid];

		if( rooms && rooms[roomid] ) {
			res.json({ 'room' : roomid, peersnum : Object.keys(peers).length, peers: peers});
		}
		else {
			res.json({ 'room' : roomid, peers: 'not exist'});
		}
	});

	app.get('/peers', function(req,res){
		//console.log('peers:', roomserver.nspio);
		var socketsnum = roomserver.nspio.sockets.length;
		var connectedSockets = Object.keys(roomserver.nspio.connected);
		var sks = [];
		roomserver.nspio.sockets.forEach(function(sk){
			console.log('sk:', sk.id);
			var tmp = {};
			tmp[sk.id] = sk.connected;
			sks.push(tmp);
		});
		res.json({ 'peersnum' : socketsnum, peers: sks});
	});

	app.get('/peer/@:peerid', function(req,res){
		//console.log('searching skid:', req.params.peerid);
		var sid = req.params.peerid;
		var sockets =  roomserver.nspio.sockets;
		var skt ;

		for( tmp in  sockets ) {
			//console.log('this?:', sockets[tmp]);

			if( sockets[tmp].id === sid ) {
				skt = sockets[tmp];
				break;				
			}
		}

		if( skt ) {
			res.json({id : sid, connected : skt.connected, rooms : skt.rooms, room : skt.room});
		}
		else {
			res.json({id :sid, status : 'not exist'});
		}
	});

	app.locals.roomserver = roomserver ;

	app.use(function(err, req, res, next) {
	    //if (err.name === 'UnauthorizedError') {
	    res.status(500).json({error: 'internal error occured'});
	    //}
	    next();
	});

	return app;
}