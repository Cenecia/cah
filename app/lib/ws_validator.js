const joi = require("joi");

const OBJECTID_LENGTH = 24; //twelve hexadecimal bytes

function check (schema, data) {
    try {
        schema.validate(data);
    } catch (e) {
        throw new Error(`Validation Failure: ${e.message || "???"}. Raw: ${JSON.stringify(e)}`);
    }
}

const incomingMessage = joi.object({
    action: joi.string()
        .required(),
    payload: joi.object()
        .required()
});

const whiteCard = joi.object({
    _id: joi.string()
        .length(OBJECTID_LENGTH)
        .required(),
    set: joi.string()
        .length(OBJECTID_LENGTH)
        .required(),
    text: joi.string()
        .min(1)
        .required(),
    isBlank: joi.boolean()
        .required()
});

const player = joi.object({
    _id: joi.string()
        .length(OBJECTID_LENGTH)
        .required(),
    name: joi.string()
        .min(2)
        .max(30)
        .required(),
    active: joi.boolean()
        .required(),
    points: joi.number()
        .integer()
        .min(0)
        .required(),
    mulligans: joi.number()
        .integer()
        .min(0)
        .required(),
    hand: joi.array().items(whiteCard)
        .required()
});

const createRequest = joi.object({
    name:joi.string()
        .min(2)
        .max(30)
        .required(),
    player: joi.string()
        .min(2)
        .max(30)
        .required(),
    sets: joi.array()
        .items(joi.string().length(OBJECTID_LENGTH))
        .min(1)
        .required(),
    timeLimit: joi.number()
        .integer()
        .min(1)
        .required(),
    scoreLimit: joi.number()
        .integer()
        .min(1)
        .required()
});

const createResponse = joi.object({
    whiteCardCount: joi.number()
        .integer()
        .min(1)
        .required(),
    blackCardCount: joi.number()
        .integer()
        .min(1)
        .required(),
    gameID: joi.string()
        .length(OBJECTID_LENGTH)
        .required(),
    players: joi.array()
        .items(joi.string().length(OBJECTID_LENGTH))
        .min(1)
        .required(),
    ownerID: joi.string()
        .length(OBJECTID_LENGTH)
        .required()
});

const joinRequest = joi.object({
    gameID: joi.string()
        .length(OBJECTID_LENGTH)
        .required(),
    playerName: joi.string()
        .min(2)
        .max(30)
        .required()
});

const joinResponse = joi.object({
    gameID: joi.string()
        .length(OBJECTID_LENGTH)
        .required(),
    players: joi.array()
        .items(player)
        .required()
});



module.exports = {
    check: check,
    incomingMessage: incomingMessage,
    whiteCard: whiteCard,
    player: player,
    createRequest: createRequest,
    createResponse: createResponse,
    joinRequest: joinRequest,
    joinResponse: joinResponse
};