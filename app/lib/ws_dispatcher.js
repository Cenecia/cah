'use strict';

const ws = require('ws');

//message schema
//  message = {
//      gameID: String,
//      action: String,
//      data: String
//  }
//let ws_messengers = [];

class WS_Messenger {
    constructor(log, socket) {
        this.log = log;
        this.socket = socket;
        this.gameID = null;

        const myself = this;
        this.message_handler = function(incoming) {
            try {
                const msg = JSON.parse(incoming);
                console.log("wsd: " + msg.gameID);
                switch(msg.action) {
                    case 'register':
                        myself.say_info("Hello!");
                        myself.say_info("I'll send you updates for " + msg.gameID);
                        myself.set_gameID(msg.gameID);
                        break;
                    case 'refresh':
                        break;
                    default:
                        myself.say_info("I don't know what that means.");
                }
            }
            catch(e) {
                console.log("wsd: " + e);
            }
        }

        this.socket.on("message", this.message_handler);
    }


    set_gameID(gameID) {
        this.gameID = gameID;
    }
    get_gameID() {
        return this.gameID;
    }

    say_info(text) {
        this.socket.send(JSON.stringify({info: text}));
    }

    say_json_data(data) {
        this.socket.send(JSON.stringify(data));
    }
}

class WS_Dispatcher {
    constructor(log, port) {
        console.log("WSD init");
        this.log = log;
        this.port = port;

        this.ws_messengers = [];

        this.server = new ws.Server({port: port});
        const myself = this;
        this.connection_handler = function(socket) {
            //this.log.info(`Connection opened: ${socket.ipAddress.toString()}`);
            console.log(`Connection opened: ${socket}`);
            myself.ws_messengers.push(new WS_Messenger(myself.log, socket));
            console.log("Total endpoints: " + myself.ws_messengers.length);
        }

        this.server.on("connection", this.connection_handler);
    }

    broadcast_game_data(gameID, data) {
        console.log(`ws broadcast ${gameID} ${JSON.stringify(data)}`);
        this.ws_messengers.filter(wsm => wsm.get_gameID() == gameID)
                          .forEach(wsm => wsm.say_json_data(data));
    }
}


module.exports = WS_Dispatcher;
