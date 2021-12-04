const joi = require("joi");

const OBJECTID_LENGTH = 24; //twelve hexadecimal bytes

function check (schema, data) {
    let result = schema.validate(data,{allowUnknown: true, convert: true} )
    if(result.error !== null) {
        throw new Error(`Validation Failure: ${result.error.message || "???"}. Raw: ${JSON.stringify(result.error)}`);
    }
}

const normalID = joi.string()
    .length(OBJECTID_LENGTH);

const limitedString = joi.string()
    .min(2)
    .max(30);

const incomingMessage = joi.object({
    action: joi.string().required(),
    payload: joi.object().required(),
    playerID: normalID.allow('').allow(null).optional()
});

const cardSet = joi.object({
    id: normalID.required(),
    name: limitedString.required(),
    set_id: limitedString.required()
})

const whiteCard = joi.object({
    id: normalID.required(),
    set: cardSet.required(),
    text: joi.string()
        .min(1)
        .required(),
    blankCard: joi.boolean().required()
});

const playerHand = joi.array().items(whiteCard).required()

const player = joi.object({
    id: normalID.required(),
    name: limitedString.required(),
    active: joi.boolean().required(),
    points: joi.number()
        .integer()
        .min(0)
        .required(),
    mulligans: joi.number()
        .integer()
        .min(0)
        .required(),
    hand: playerHand
        .required()
});

const createRequest = joi.object({
    name:limitedString.required(),
    player: limitedString.required(),
    sets: joi.array()
        .items(normalID)
        .min(1)
        .required(),
    time_limit: joi.number()
        .integer()
        .min(1)
        .required(),
    score_limit: joi.number()
        .integer()
        .min(1)
        .required()
});

const createResponse = joi.object({
    whiteCardCount: joi.number()
        .integer()
        .min(0)
        .required(),
    blackCardCount: joi.number()
        .integer()
        .min(0)
        .required(),
    gameID: normalID.required(),
    players: joi.array()
        .items(player)
        .min(1)
        .required(),
    ownerID: normalID.required()
});

const joinRequest = joi.object({
    gameID: normalID.required(),
    playerName: limitedString.required()
});

const joinResponse = joi.object({
    gameID: normalID.required(),
    players: joi.array()
        .items(player)
        .required()
});

const handRequest = joi.object({
    playerID: normalID.required(),
    gameID: normalID.required()
});

//this is basically the Player object but with an array of cards attached
const handResponse = joi.object({
    id: normalID.required(),
    name: limitedString.required(),
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
    hand: joi.array()
        .items(whiteCard)
        .min(0)
        .required(),
})

module.exports = {
    check: check,
    incomingMessage: incomingMessage,
    whiteCard: whiteCard,
    player: player,
    createRequest: createRequest,
    createResponse: createResponse,
    joinRequest: joinRequest,
    joinResponse: joinResponse,
    handRequest: handRequest,
    handResponse: handResponse,
    cardSet: cardSet
};