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
                case 'join':
                    this.log.info(`Join message from player ${this.get_player_id()} and game ${msg.payload.gameID}`);
                    const join_data = await this.game_service.joinGame(msg.payload);
                    this.set_player_id(join_data.players[join_data.players.length-1]._id.toString()); //todo: this seems like a bad way to assign IDs
                    await this.say("join", join_data);
                    await this.dispatcher.broadcast_game_data(join_data.players.map(p => p._id.toString()), "update", join_data);
                    break;
                case 'rejoin':
                    this.log.info(`Rejoin message from player ${msg.player_id} and game ${msg.payload.gameID}`);
                    //todo: make sure game exists and is in session
                    //kick the ghost, if any
                    try {
                        await this.dispatcher.kick_player(msg.player_id); //todo: this could be abused by cloning playerIDs and kicking others
                    }
                    catch (e) {
                        this.log.info(`Remove Ghost raised exception ${e}`);
                    }
                    this.set_player_id(msg.player_id);
                    //say round, client will request hand, everything should be peachy
                    const rejoin_round = await this.game_service.getLatestRound(msg.payload);
                    await this.say("round", rejoin_round);
                    break;
                case 'create':
                    this.log.info(`Create new game message...`);
                    const create_data = await this.game_service.createGame(msg.payload);
                    this.set_player_id(create_data.players[create_data.players.length-1]._id.toString()); //todo: this seems like a bad way to assign IDs
                    await this.say("create", create_data);
                    break;
                case 'start_round':
                    this.log.info(`Start Round message from player ${this.get_player_id()} and game ${msg.payload.gameID}`);
                    const start_data = await this.game_service.startRound(msg.payload);
                    await this.dispatcher.broadcast_game_data(start_data.players.map(p => p._id.toString()), "round", start_data);
                    break;
                // case 'round':
                //     this.log.info(`Round message for player ${this.get_player_id()} and game ${msg.payload.gameID}`);
                //     const round_data = await this.game_service.getLatestRound(msg.payload);
                //     await this.dispatcher.broadcast_game_data(round_data.players.map(p => p._id.toString()), "round", round_data);
                //     break;
                case 'hand':
                    this.log.info(`Hand message from player ${this.get_player_id()}`);
                    const hand_data = await this.game_service.getHand(msg.payload);
                    await this.say("hand", hand_data);
                    break;
                case 'mulligan':
                    this.log.info(`Hand message from player ${this.get_player_id()}`);
                    const mulligan_data = await this.game_service.mulligan(msg.payload);
                    await this.say("hand", mulligan_data);
                    break;
                case 'submit_white':
                    this.log.info(`Submit White message from player ${this.get_player_id()} and game ${msg.payload.gameID}`);
                    const white_data = await this.game_service.submitWhiteCard(msg.payload);
                    await this.say("hand", white_data.players.find(p => p._id.toString() === this.get_player_id()).hand);
                    await this.dispatcher.broadcast_game_data(white_data.players.map(p => p._id.toString()), "round", white_data);
                    break;
                case 'select_candidate':
                    this.log.info(`Select candidate message from player ${this.get_player_id()} and game ${msg.payload.gameID}`);
                    await this.game_service.selectCandidateCard(msg.payload);
                    const select_data = await this.game_service.getLatestRound(msg.payload);
                    await this.dispatcher.broadcast_game_data(select_data.players.map(p => p._id.toString()), "round", select_data);
                    break;
                case 'kick':
                    this.log.info(`Kick message from player ${this.get_player_id()} and game ${msg.payload.gameID}`);
                    const kick_data = await this.game_service.kickPlayer(msg.payload);
                    await this.dispatcher.broadcast_game_data(kick_data.players.map(p => p._id.toString()), "kick", kick_data);
                    await this.dispatcher.broadcast_game_data([msg.payload.playerID], "kick", kick_data);
                    await this.dispatcher.kick_player(msg.payload.playerID);
                    break;
                case 'refresh':
                    break;
                default:
                    this.log.warn(`Unhandled event: ${this.msg}`);
                    await this.say("info","I don't know what that means.");
            }
        }
        catch(e) {
            this.log.error("wsd mh: " + e);
        }
    }

    /**
     * Sets the player ID for this messenger.
     * @param player_id - string (anything else will have toString() called on it)
     */
    set_player_id(player_id) {
        if(typeof(player_id) !== "string") {
            player_id = player_id.toString();
        }
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
                playerID: this.get_player_id(),
                payload: payload
            }));
        }
        else {
            return null;
        }
    }

    /**
     * Close the connection.
     */
    async close() {
        if(this.socket !== null) {
            await this.socket.close();
            this.socket = null;
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
     * @param players - array of string IDs
     * @param action
     * @param payload
     */
    async broadcast_game_data(players, action, payload) {
        try {
            this.log.info(`ws broadcast ${JSON.stringify(players)} ${JSON.stringify(action)} ${JSON.stringify(payload)}`);
            for (const player of players) {
                let messenger = this.ws_messengers.find(wsm => wsm.get_player_id() === player);
                await messenger.say(action, payload);
            }
        }
        catch(e) {
            this.log.error("ws broadcast: " + e);
        }
    }

    /**
     * Send an action and payload to a specific player.
     * @param player_id
     * @param action
     * @param payload
     */
    async message_player(player_id, action, payload) {
        this.log.info(`ws message ${JSON.stringify(player_id)} ${JSON.stringify(action)} ${JSON.stringify(payload)}`);
        const messenger = this.ws_messengers.find(wsm => wsm.get_player_id() === player_id);
        await messenger.say(action, payload);
    }

    /**
     * Remove a player from the messenger list, including closing its connection.
     * @param player_id
     */
    async kick_player(player_id) {
        this.log.info(`ws kick ${JSON.stringify(player_id)}`);
        const messenger = this.ws_messengers.find(wsm => wsm.get_player_id() === player_id);
        if(messenger !== undefined) {
            messenger.close();
            this.ws_messengers = this.ws_messengers.filter(wsm => wsm.get_player_id() !== player_id)
        }
    }

    //todo: cleanup, etc.
}


module.exports = WS_Dispatcher;
