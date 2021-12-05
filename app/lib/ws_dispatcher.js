'use strict';

const wsv = require("./ws_validator");
const ws = require('ws');


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
     * TODO: better security
     * @param incoming
     */
    async messageHandler(incoming){
        try {
            const msg = JSON.parse(incoming);
            wsv.checkAndClean(wsv.incomingMessage, msg);
            switch(msg.action) {
                case 'joinRequest':
                    msg.payload = wsv.checkAndClean(wsv.joinRequest, msg.payload);
                    await this.joinRequest(msg);
                    break;
                case 'rejoinRequest':
                    msg.payload = wsv.checkAndClean(wsv.rejoinRequest, msg.payload);
                    await this.rejoinRequest(msg);
                    break;
                case 'createRequest':
                    msg.payload = wsv.checkAndClean(wsv.createRequest, msg.payload);
                    await this.createRequest(msg);
                    break;
                case 'startRound':
                    msg.payload = wsv.checkAndClean(wsv.startRoundRequest, msg.payload)
                    await this.startRound(msg);
                    break;
                case 'handRequest':
                    msg.payload = wsv.checkAndClean(wsv.handRequest, msg.payload);
                    await this.getHand(msg);
                    break;
                case 'mulligan':
                    msg.payload = wsv.checkAndClean(wsv.mulliganRequest, msg.payload);
                    await this.mulligan(msg);
                    break;
                case 'submitWhite':
                    msg.payload = wsv.checkAndClean(wsv.submitWhiteRequest, msg.payload);
                    await this.submitWhite(msg);
                    break;
                case 'selectCandidate':
                    msg.payload = wsv.checkAndClean(wsv.selectCandidateRequest, msg.payload);
                    await this.selectCandidate(msg);
                    break;
                case 'kickRequest':
                    msg.payload = wsv.checkAndClean(wsv.kickRequest, msg.payload);
                    await this.kickRequest(msg);
                    break;
                case 'refresh':
                    break;
                default:
                    await this.say_error(`Unhandled event: ${msg.action}`);
            }
        }
        catch(e) {
            if(e.hasOwnProperty("message")) {
                await this.say_error("Exception: " + e.message);
            }
            else {
                await this.say_error("Error: " + e.toString());
            }
        }
    }

    async kickRequest(msg) {
        //TODO check if this player is the game owner
        this.msg_log(this.getPlayerID(), msg.payload.gameID, "kickRequest");
        const kick_data = wsv.checkAndClean(wsv.kickResponse, await this.gameService.kickPlayer(msg.payload.gameID, msg.payload.kickeeID));
        await this.dispatcher.broadcastGameData(kick_data.players.map(p => p.id), "kickMessage", kick_data);
        await this.dispatcher.broadcastGameData([msg.payload.kickeeID], "kickMessage", kick_data);
        await this.dispatcher.kickPlayer(msg.payload.kickeeID);
    }

    async rejoinRequest(msg) {
        this.msg_log(this.getPlayerID(), msg.payload.gameID, "rejoinRequest");
        //TODO: make sure game exists and is in session
        //kick the ghost, if any
        try {
            await this.dispatcher.kickPlayer(msg.payload.playerID); //TODO: this could be abused by cloning playerIDs and kicking others
        } catch (e) {
            this.log.info(`Remove Ghost raised exception ${e}`);
        }
        this.setPlayerID(msg.payload.playerID);
        //say round, client will request hand, everything should be peachy
        const rejoin_round = wsv.checkAndClean(wsv.roundResponse, await this.gameService.getLatestRound(msg.payload.gameID));
        await this.say("round", rejoin_round);
    }

    async mulligan(msg) {
        this.msg_log(this.getPlayerID(), msg.payload.gameID, "mulligan");
        if(await this.gameService.mulligan(msg.payload.playerID, msg.payload.gameID)) {
            const hand_data = wsv.checkAndClean(wsv.handResponse, await this.gameService.getHand(msg.payload.playerID));
            await this.say("handResponse", hand_data);
        }
        else {
            await this.say("info", "No mulligans left!");
        }
    }

    async selectCandidate(msg) {
        this.msg_log(this.getPlayerID(), msg.payload.gameID, "selectCandidate");
        await this.gameService.selectCandidateCard(msg.payload.gameID, msg.payload.playerID, msg.payload.roundID);
        const select_data = wsv.checkAndClean(wsv.roundResponse, await this.gameService.getLatestRound(msg.payload.gameID));
        await this.dispatcher.broadcastGameData(select_data.players.map(p => p.id), "round", select_data);
    }

    async submitWhite(msg) {
        this.msg_log(this.getPlayerID(), msg.payload.gameID, "submitWhite");
        const white_data = wsv.checkAndClean(wsv.roundResponse,
            await this.gameService.submitWhiteCard(msg.payload.playerID, msg.payload.roundID, msg.payload.whiteCards));
        await this.say("hand", white_data.players.find(p => p.id === this.getPlayerID()).hand);
        await this.dispatcher.broadcastGameData(white_data.players.map(p => p.id), "round", white_data);
    }

    async startRound(msg) {
        this.msg_log(this.getPlayerID(), msg.payload.gameID, "startRound");
        const start_data = wsv.checkAndClean(wsv.roundResponse, await this.gameService.startRound(msg.payload.gameID));
        await this.dispatcher.broadcastGameData(start_data.players.map(p => p.id), "round", start_data);
    }

    async getHand(msg) {
        this.msg_log(this.getPlayerID(), msg.payload.gameID, "HandRequest");
        const hand_data = wsv.checkAndClean(wsv.handResponse, await this.gameService.getHand(msg.payload.playerID));
        await this.say("handResponse", hand_data);
    }

    async createRequest(msg) {
        this.msg_log(this.getPlayerID(), msg.payload.gameID, "CreateRequest");
        const create_data = wsv.checkAndClean(wsv.createResponse, await this.gameService.createGame(msg.payload));
        this.setPlayerID(create_data.players[create_data.players.length - 1].id); //TODO: this seems like a bad way to assign IDs
        await this.say("createResponse", create_data);
    }

    async joinRequest(msg) {
        this.msg_log(this.getPlayerID(), msg.payload.gameID, "JoinRequest");
        const join_data = wsv.checkAndClean(wsv.joinResponse, await this.gameService.joinGame(msg.payload.gameID, msg.payload.playerName));
        this.setPlayerID(join_data.players[join_data.players.length - 1].id); //TODO: this seems like a bad way to assign IDs
        await this.say("joinResponse", join_data);
        await this.dispatcher.broadcastGameData(join_data.players.map(p => p.id), "update", join_data);
    }

    /**
     * Convenience function to make a log entry.
     * @param player_id
     * @param game_id
     * @param text
     */
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
                payload: error
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

}


module.exports = WS_Dispatcher;
