const joi = require("joi");

const OBJECTID_LENGTH = 24; //twelve hexadecimal bytes

/**
 * Validates data using schema, removing unrecognized fields. Throws and exception if validation fails. Returns
 * the cleaned value.
 *
 * @param schema
 * @param data
 * @returns {*}
 */
function checkAndClean (schema, data) {
    let result = schema.validate(data,{allowUnknown: true, convert: true, stripUnknown: true} )
    if(result.error !== null) {
        throw new Error(`Validation Failure: ${result.error.message || "???"}. Raw: ${JSON.stringify(result.error)}`);
    }
    return result.value;
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

const blackCard = joi.object({
    text: joi.string()
       .min(1)
       .required(),
    pick: joi.number()
        .integer()
        .min(0)
        .required(),
    set: cardSet.required()
});

const candidateCards = joi.array().items(
    joi.object({
        cards: joi.array()
            .items(joi.string()
                .min(1))
            .min(0)
            .required(),
        winner: joi.boolean().required(),
        player: normalID.required(),
        id: normalID
    })
);


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
    hand: joi.array()
        .items(normalID)
        .required()
});

const game = joi.object({
    players: joi.array()
        .items(normalID)
        .min(1)
        .required(),
    whiteCards: joi.array()
        .items(normalID)
        .required(),
    blackCards: joi.array()
        .items(normalID)
        .required(),
    rounds: joi.array()
        .items(normalID)
        .required(),
    czar: joi.number()
        .integer()
        .min(0)
        .required(),
    timeLimit: joi.number()
        .integer()
        .min(1)
        .required(),
    scoreLimit: joi.number()
        .integer()
        .min(1)
        .required(),
    name: limitedString.required(),
    owner: normalID.required()
})

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
    owner: normalID.required(),
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
});

const submitWhiteRequest = joi.object({
    roundID: normalID.required(),
    playerID: normalID.required(),
    whiteCards: joi.array()
        .items(joi.object({
            cardID: normalID.required(),
            cardText: joi.string().allow("").required()
        }))
        .min(1)
        .required()
});

const selectCandidateRequest = joi.object({
    gameID: normalID.required(),
    roundID: normalID.required(),
    playerID: normalID.required()
});

const startRoundRequest = joi.object({
    gameID: normalID.required()
});

const mulliganRequest = joi.object({
    gameID: normalID.required(),
    playerID: normalID.required()
})

const roundResponse = joi.object({
    id: normalID.required(),
    players: joi.array()
        .items(player)
        .required(),
    status: limitedString.required(),
    blackCard: blackCard.required(),
    game: game.required(),
    candidateCards: candidateCards,
    czar: normalID.required(),
    startTime: joi.date().required(),
    winner: player.optional()
});

module.exports = {
    checkAndClean: checkAndClean,
    incomingMessage: incomingMessage,
    whiteCard: whiteCard,
    blackCard: blackCard,
    player: player,
    createRequest: createRequest,
    createResponse: createResponse,
    joinRequest: joinRequest,
    joinResponse: joinResponse,
    handRequest: handRequest,
    handResponse: handResponse,
    submitWhiteRequest: submitWhiteRequest,
    selectCandidateRequest: selectCandidateRequest,
    startRoundRequest: startRoundRequest,
    mulliganRequest: mulliganRequest,
    roundResponse: roundResponse,
    cardSet: cardSet
};