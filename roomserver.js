
var config = require('./config');
var crypto = require('crypto');

function RoomServer(io) {
    console.log('RoomServer created with io');
    var self =this;
    var nspio = self.nspio = io.of('/webrtc');

    self.nspio.on('connection', function (skt) {
        console.log('socket connected : ' + skt.id);

        var socket = skt;

        socket.resources = {
            screen: false,
            video: true,
            audio: false
        };

        // pass a message to another id
        socket.on('message', function (details) {
        //console.log('socket:' + socket.id + 'msging:', JSON.stringify(details));
            if (!details) return;

            // socket.rooms.forEach(function(room){
            //     socket.to(room).broadcast.emit(details);
            // })

            var othersocket = self.nspio.connected[details.to];
            if (!othersocket) return;
        
        //console.log('to socket:' + details.to);
            console.log('msg type:', details.type );
            details.from = socket.id;
            othersocket.emit('message', details);
        });

        socket.on('shareScreen', function () {
            socket.resources.screen = true;
        });

        socket.on('unshareScreen', function (type) {
            socket.resources.screen = false;
            removeFeed('screen');
        });

        socket.on('join', join);

        function safeCb(cb) {
            if (typeof cb === 'function') {
                return cb;
            } else {
                return function () {};
            }
        };

        //RoomServer.prototype.tag = 'RoomServer';
        function describeRoom(rname) { 
            //var sockets = io.sockets.sockets(name);
            var sockets = self.nspio.adapter.rooms[rname];
            var result = {
                clients: {}
            };
            
            if( sockets ) {
                //console.log('rooms[name]: ', sockets);
                for(var skt in sockets) {
                    //console.log('conn[] : ', self.nspio.connected[skt]);
                    result.clients[skt] = self.nspio.connected[skt].resources;
                }
            }
            //console.log('room des: ', result);
            return result;
        }

        function socketsInRoom(rname){
            return Object.keys(self.nspio.adapter.rooms[rname]).length;
        }

        function removeFeed(type) {
            if (socket.room) {
            console.log('socket:'+socket.id + ' broadcasting leave room');

                socket.in(socket.room).emit('remove', {
                    id: socket.id,
                    type: type
                });
                if (!type) {
            console.log('left room:' + socket.room);
                    socket.leave(socket.room);
                    socket.room = undefined;
                }
            }
        };

        function join(name, cb) {
            console.log('soket in join():', socket.id);

            // sanity check
            if (typeof name !== 'string') return;
            // check if maximum number of sockets reached
            if (config.rooms && config.rooms.maxsockets > 0 && 
              socketsInRoom(name) >= config.rooms.maxsockets) {
                safeCb(cb)('full');
                return;
            }
            // leave any existing rooms
            
            if( socket.room !== name ) {
                removeFeed();   
                safeCb(cb)(null, describeRoom(name));
                console.log('socket:'+socket.id + ' join room:' + name);
                socket.join(name);
                socket.room = name;
            }
        };

        // we don't want to pass "leave" directly because the
        // event type string of "socket end" gets passed too.
        socket.on('disconnect', function () {
        console.log('socket disconnect:' + socket.id);
            removeFeed();
        });
        socket.on('leave', function () {
        console.log('socket leave:' + socket.id);
            removeFeed();
        });

        socket.on('create', function (name, cb) {
            if (arguments.length == 2) {
                cb = (typeof cb == 'function') ? cb : function () {};
                name = name || uuid();
            } else {
                cb = name;
                name = uuid();
            }
            // check if exists
            if (self.nspio.adapter.rooms[name].length) {
            //console.log('room taken:' + name);
                safeCb(cb)('taken');
            } else {
                join(name).bind(self);
                safeCb(cb)(null, name);
            }
        });

        // support for logging full webrtc traces to stdout
        // useful for large-scale error monitoring
        socket.on('trace', function (data) {
            console.log('trace', JSON.stringify(
                [data.type, data.session, data.prefix, data.peer, data.time, data.value]
            ));
        });

        // tell client about stun and turn servers and generate nonces
        socket.emit('stunservers', config.stunservers || []);

        // create shared secret nonces for TURN authentication
        // the process is described in draft-uberti-behave-turn-rest
        var credentials = [];
        config.turnservers.forEach(function (server) {
            var hmac = crypto.createHmac('sha1', server.secret);
            // default to 86400 seconds timeout unless specified
            var username = Math.floor(new Date().getTime() / 1000) + (server.expiry || 86400) + "";
            hmac.update(username);
            credentials.push({
                username: username,
                credential: hmac.digest('base64'),
                url: server.url
            });
        });
        socket.emit('turnservers', credentials);        

    });        
}

// //RoomServer.prototype.tag = 'RoomServer';
// RoomServer.prototype.describeRoom = function (rname) { 
//     //var sockets = io.sockets.sockets(name);
//     var sockets = self.nspio.adapter.rooms[rname];
//     var result = {
//         sockets: {}
//     };
//     sockets.forEach(function (socket) {
//         result.sockets[socket.id] = socket.resources;
//     });
//     //console.log('in room: ', JSON.stringify(result));
//     return result;
// }

// RoomServer.prototype.socketsInRoom = function (rname){
//     return Object.keys(self.nspio.adapter.rooms[rname]).length;
// }


module.exports = function (socketio) {
    return new RoomServer(socketio);
}