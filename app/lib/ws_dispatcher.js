'use strict';

const wsv = require("./ws_validator");
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
        this.gameService = game_service;
        this.playerID = null;


        const myself = this;
        this._messageHandler = function(incoming) {
            return myself.messageHandler(incoming);
        }

        this.socket.on("message", this._messageHandler);
        this.socket.on("close", function() {
            myself.log.info(`Closed socket attached to player ${myself.playerID}`);
            myself.socket = null;
        });
    }

    /**
     * Handles incoming WebSocket message payloads.
     * todo: validation of identifiers and payloads, better security
     * @param incoming
     */
    async messageHandler(incoming){
        try {
            const msg = JSON.parse(incoming);
            wsv.check(wsv.incomingMessage, msg);
            switch(msg.action) {
                case 'joinRequest':
                    wsv.check(wsv.joinRequest, msg.payload);
                    await this.joinRequest(msg);
                    break;
                case 'rejoin':
                    this.log.info(`Rejoin message from player ${msg.playerID} and game ${msg.payload.gameID}`);
                    //todo: make sure game exists and is in session
                    //kick the ghost, if any
                    try {
                        await this.dispatcher.kickPlayer(msg.playerID); //todo: this could be abused by cloning playerIDs and kicking others
                    }
                    catch (e) {
                        this.log.info(`Remove Ghost raised exception ${e}`);
                    }
                    this.setPlayerID(msg.playerID);
                    //say round, client will request hand, everything should be peachy
                    const rejoin_round = await this.gameService.getLatestRound(msg.payload);
                    await this.say("round", rejoin_round);
                    break;
                case 'createRequest':
                    this.log.info(`Create new game message...`);
                    const create_data = await this.gameService.createGame(msg.payload);
                    this.setPlayerID(create_data.players[create_data.players.length-1]._id.toString()); //todo: this seems like a bad way to assign IDs
                    await this.say("createResponse", create_data);
                    break;
                case 'startRound':
                    this.log.info(`Start Round message from player ${this.getPlayerID()} and game ${msg.payload.gameID}`);
                    const start_data = await this.gameService.startRound(msg.payload);
                    await this.dispatcher.broadcastGameData(start_data.players.map(p => p._id.toString()), "round", start_data);
                    break;
                // case 'round':
                //     this.log.info(`Round message for player ${this.get_player_id()} and game ${msg.payload.gameID}`);
                //     const round_data = await this.game_service.getLatestRound(msg.payload);
                //     await this.dispatcher.broadcast_game_data(round_data.players.map(p => p._id.toString()), "round", round_data);
                //     break;
                case 'hand':
                    this.log.info(`Hand message from player ${this.getPlayerID()}`);
                    const hand_data = await this.gameService.getHand(msg.payload);
                    await this.say("hand", hand_data);
                    break;
                case 'mulligan':
                    this.log.info(`Hand message from player ${this.getPlayerID()}`);
                    const mulligan_data = await this.gameService.mulligan(msg.payload);
                    await this.say("hand", mulligan_data);
                    break;
                case 'submitWhite':
                    this.log.info(`Submit White message from player ${this.getPlayerID()} and game ${msg.payload.gameID}`);
                    const white_data = await this.gameService.submitWhiteCard(msg.payload);
                    await this.say("hand", white_data.players.find(p => p._id.toString() === this.getPlayerID()).hand);
                    await this.dispatcher.broadcastGameData(white_data.players.map(p => p._id.toString()), "round", white_data);
                    break;
                case 'selectCandidate':
                    this.log.info(`Select candidate message from player ${this.getPlayerID()} and game ${msg.payload.gameID}`);
                    await this.gameService.selectCandidateCard(msg.payload);
                    const select_data = await this.gameService.getLatestRound(msg.payload);
                    await this.dispatcher.broadcastGameData(select_data.players.map(p => p._id.toString()), "round", select_data);
                    break;
                case 'kick':
                    this.log.info(`Kick message from player ${this.getPlayerID()} and game ${msg.payload.gameID}`);
                    const kick_data = await this.gameService.kickPlayer(msg.payload);
                    await this.dispatcher.broadcastGameData(kick_data.players.map(p => p._id.toString()), "kick", kick_data);
                    await this.dispatcher.broadcastGameData([msg.payload.playerID], "kick", kick_data);
                    await this.dispatcher.kickPlayer(msg.payload.playerID);
                    break;
                case 'refresh':
                    break;
                default:
                    await this.say_error(`Unhandled event: ${msg.action}`);
            }
        }
        catch(e) {
            await this.say_error("Error: " + JSON.stringify(e));
        }
    }

    async joinRequest(msg) {
        this.msg_log(this.getPlayerID(), msg.payload.gameID);
        const join_data = await this.gameService.joinGame(msg.payload.gameID, msg.payload.playerName);
        wsv.check(wsv.joinResponse, join_data);
        this.setPlayerID(join_data.players[join_data.players.length - 1]._id.toString()); //todo: this seems like a bad way to assign IDs
        await this.say("joinResponse", join_data);
        await this.dispatcher.broadcastGameData(join_data.players.map(p => p._id.toString()), "update", join_data);
    }

    msg_log(player_id, game_id, text=''){
        this.log.info(`Player: ${this.getPlayerID()} Game: ${game_id} ${text}`);
    }

    /**
     * Sets the player ID for this messenger.
     * @param player_id - string (anything else will have toString() called on it)
     */
    setPlayerID(player_id) {
        if(typeof(player_id) !== "string") {
            player_id = player_id.toString();
        }
        this.playerID = player_id;
    }

    /**
     * Returns gets the player ID for this messenger.
     * @returns playerID
     */
    getPlayerID() {
        return this.playerID;
    }

    /**
     * Returns true if the attached socket was closed.
     * @returns {boolean}
     */
    isClosed() {
        return this.socket === null;
    }

    /**
     * Transmits a message to the player associated with this messenger.
     * @param action
     * @param payload
     */
    async say(action, payload) {
        if(!this.isClosed()) {
            return this.socket.send(JSON.stringify({
                action: action,
                playerID: this.getPlayerID(),
                payload: payload
            }));
        }
        else {
            return null;
        }
    }
    /**
     * Transmits an error message to the player associated with this messenger.
     * @param error An exception; will be stringified
     */
    async say_error(error) {
        this.log.error(error);
        if(!this.isClosed()) {
            return this.socket.send(JSON.stringify({
                action: "error",
                playerID: this.getPlayerID(),
                payload: error.message
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
        this.gameService = game_service;
        this.port = port;
        this.messengers = [];

        this.server = new ws.Server({port:this.port});
        const myself = this;
        this._connectionHandler = function(socket) {
            myself.connectionHandler(socket);
        }
        this.server.on("connection", this._connectionHandler);
    }

    /**
     * Handles new connections. Creates an unidentified WS_Messenger to handle incoming data.
     * @param socket
     */
    connectionHandler(socket) {
        //this.log.info(`Connection opened: ${socket.ipAddress.toString()}`);
        this.log.info(`Connection opened: ${socket}`);
        this.messengers.push(new WS_Messenger(this, this.log, this.gameService, socket));
        this.log.info("Total endpoints: " + this.messengers.length);

    }

    /**
     * Send an action and payload to a list of players.
     * @param players - array of string IDs
     * @param action
     * @param payload
     */
    async broadcastGameData(players, action, payload) {
        try {
            this.log.info(`ws broadcast ${JSON.stringify(players)} ${JSON.stringify(action)} ${JSON.stringify(payload)}`);
            for (const player of players) {
                let messenger = this.messengers.find(wsm => wsm.getPlayerID() === player);
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
    async messagePlayer(player_id, action, payload) {
        this.log.info(`ws message ${JSON.stringify(player_id)} ${JSON.stringify(action)} ${JSON.stringify(payload)}`);
        const messenger = this.messengers.find(wsm => wsm.getPlayerID() === player_id);
        await messenger.say(action, payload);
    }

    /**
     * Remove a player from the messenger list, including closing its connection.
     * @param player_id
     */
    async kickPlayer(player_id) {
        this.log.info(`ws kick ${JSON.stringify(player_id)}`);
        const messenger = this.messengers.find(wsm => wsm.getPlayerID() === player_id);
        if(messenger !== undefined) {
            messenger.close();
            this.messengers = this.messengers.filter(wsm => wsm.getPlayerID() !== player_id)
        }
    }

    //todo: cleanup, etc.
}


module.exports = WS_Dispatcher;
