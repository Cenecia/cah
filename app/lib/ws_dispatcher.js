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
    /**
     * Constructs a messenger object.
     * @param log
     * @param game_service
     * @param socket
     * @constructor
     */
    constructor(log, game_service, socket) {
        this.log = log;
        this.socket = socket;
        this.game_service = game_service;
        this.player_id = null;


        const myself = this;
        this._message_handler = function(incoming) {
            return myself.message_handler(incoming);
        }

        this.socket.on("message", this._message_handler);
    }

    /**
     * Handles incoming WebSocket message payloads.
     * todo: validation of identifiers, better security
     * @param incoming
     */
    async message_handler(incoming){
        try {
            const msg = JSON.parse(incoming);
            switch(msg.action) {
                case 'register':
                    await this.say("info", "Hello!");
                    await this.say("info", "I'll send you updates for " + msg.player_id);
                    this.set_player_id(msg.player_id);
                    break;
                case 'join': //todo: handle rejoin situation?
                    this.log.info(`Join message for player ${this.get_player_id()} and game ${msg.payload.gameID}`);
                    const game_data = await this.game_service.joinGame(msg.payload);
                    let player_id = game_data.players[game_data.players.length-1]._id; //todo: this seems like a bad way to assign IDs
                    await this.say("join", game_data);
                    break;
                case 'refresh':
                    break;
                default:
                    await this.say("info","I don't know what that means.");
            }
        }
        catch(e) {
            this.log.error("wsd: " + e);
        }
    }

    /**
     * Sets the player ID for this messenger.
     * @param player_id
     */
    set_player_id(player_id) {
        this.player_id = player_id;
    }

    /**
     * Returns gets the player ID for this messenger.
     * @returns player_id
     */
    get_player_id() {
        return this.player_id;
    }

    /**
     * Transmits a message to the player associated with this messenger.
     * @param action
     * @param payload
     */
    async say(action, payload) {
        return this.socket.send(JSON.stringify({action: action, player_id: this.get_player_id(), payload: payload}));
    }
}

class WS_Dispatcher {
    /**
     * Constructs a WebSockets dispatcher handler object.
     * @param log
     * @param game_service
     * @param port
     * @constructor
     */
    constructor(log, game_service, port) {
        this.log = log;
        this.log.info("WSD init");
        this.game_service = game_service;
        this.port = port;
        this.ws_messengers = [];

        this.server = new ws.Server({port:this.port});
        const myself = this;
        this._connection_handler = function(socket) {
            myself.connection_handler(socket);
        }
        this.server.on("connection", this._connection_handler);
    }

    /**
     * Handles new connections. Creates an unidentified WS_Messenger to handle incoming data.
     * @param socket
     */
    connection_handler(socket) {
        //this.log.info(`Connection opened: ${socket.ipAddress.toString()}`);
        this.log.info(`Connection opened: ${socket}`);
        this.ws_messengers.push(new WS_Messenger(this.log, this.game_service, socket));
        this.log.info("Total endpoints: " + this.ws_messengers.length);

    }

    /**
     * Send an action and payload to a list of players.
     * @param players
     * @param action
     * @param payload
     */
    broadcast_game_data(players, action, payload) {
        this.log.info(`ws broadcast ${JSON.stringify(players)} ${JSON.stringify(action)} ${JSON.stringify(payload)}`);
        for(const player of players) {
            this.ws_messengers.filter(wsm => wsm.get_player_id() === player)
                              .forEach(wsm => wsm.say(action, payload));
        }
    }

    /**
     * Send an action and payload to a specific player.
     * @param player_id
     * @param action
     * @param payload
     */
    message_player(player_id, action, payload) {
        this.log.info(`ws message ${JSON.stringif(player_id)} ${JSON.stringify(action)} ${JSON.stringify(payload)}`);
        const messenger = this.ws_messengers.findOne(wsm => wsm.get_player_id() === player_id);
        messenger.say(action, payload);
    }

    //todo: kick player, cleanup, etc.
}


module.exports = WS_Dispatcher;
