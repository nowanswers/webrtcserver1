
var config = {};

config.rooms = {};

config.rooms.maxClients = 2;

config.stunservers = [
    /*
        {"url": "stun:stun.l.google.com:19302"}
    */
    ];
config.turnservers = [
        
        { "url": "turn:208.75.75.109",
          "secret": "nowansrlogen",
          "expiry": 86400 }
         
    ];

module.exports = config;

