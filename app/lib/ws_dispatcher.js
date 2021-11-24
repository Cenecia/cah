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
     * @param dispatcher
     * @param log
     * @param game_service
     * @param socket
     * @constructor
     */
    constructor(dispatcher, log, game_service, socket) {
        this.dispatcher = dispatcher;
        this.log = log;
        this.socket = socket;
        this.game_service = game_service;
        this.player_id = null;


        const myself = this;
        this._message_handler = function(incoming) {
            return myself.message_handler(incoming);
        }

        this.socket.on("message", this._message_handler);
        this.socket.on("close", function() {
            myself.log.info(`Closed socket attached to player ${myself.player_id}`);
            myself.socket = null;
        });
    }

    /**
     * Handles incoming WebSocket message payloads.
     * todo: validation of identifiers and payloads, better security
     * @param incoming
     */
    async message_handler(incoming){
        try {
            const msg = JSON.parse(incoming);
            switch(msg.action) {
                // case 'register':
                //     await this.say("info", "Hello!");
                //     await this.say("info", "I'll send you updates for " + msg.player_id);
                //     this.set_player_id(msg.player_id);
                //     break;
                case 'join': //todo: handle rejoin situation?
                    this.log.info(`Join message for player ${this.get_player_id()} and game ${msg.payload.gameID}`);
                    const join_data = await this.game_service.joinGame(msg.payload);
                    this.set_player_id(join_data.players[join_data.players.length-1]._id); //todo: this seems like a bad way to assign IDs
                    await this.say("join", join_data);
                    await this.dispatcher.broadcast_game_data(join_data.players.map(p => p._id), "update", join_data);
                    break;
                case 'create':
                    this.log.info(`Create new game message...`);
                    const create_data = await this.game_service.createGame(msg.payload);
                    this.set_player_id(create_data.players[create_data.players.length-1]._id); //todo: this seems like a bad way to assign IDs
                    await this.say("create", create_data);
                    break;
                case 'submit_white':
                    this.log.info(`Submit White message for player ${this.get_player_id()} and game ${msg.payload.gameID}`);
                    const round_data = this.game_service.submitWhiteCard(msg.payload);
                    await this.say("hand", round_data.players.findOne(p => p._id === this.get_player_id()).hand);
                    await this.dispatcher.broadcast_game_data(round_data.players.map(p => p._id), "round", round_data);
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
     * Returns true if the attached socket was closed.
     * @returns {boolean}
     */
    is_closed() {
        return this.socket === null;
    }

    /**
     * Transmits a message to the player associated with this messenger.
     * @param action
     * @param payload
     */
    async say(action, payload) {
        if(!this.is_closed()) {
            return this.socket.send(JSON.stringify({
                action: action,
                player_id: this.get_player_id(),
                payload: payload
            }));
        }
        else {
            return null;
        }
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
        this.ws_messengers.push(new WS_Messenger(this, this.log, this.game_service, socket));
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
