const joi = require("joi");

const OBJECTID_LENGTH = 24; //twelve hexadecimal bytes

function check (schema, data) {
    try {
        schema.validate(data);
    } catch (e) {
        throw new Error(`Validation Failure: ${e.message || "???"}. Raw: ${JSON.stringify(e)}`);
    }
}

const incoming_message = joi.object({
    action: joi.string()
        .required(),
    payload: joi.object()
        .required()
});

const white_card = joi.object({
    set: joi.string()
        .length(OBJECTID_LENGTH)
        .required(),
    text: joi.string()
        .min(1)
        .required(),
    is_blank: joi.boolean()
        .required()
});

const player = joi.object({
    name: joi.string()
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
    hand: joi.array().items(white_card)
        .required()
});

const create_request = joi.object({
    game_name:joi.string()
        .min(2)
        .max(30)
        .required(),
    player_id: joi.string()
        .length(OBJECTID_LENGTH)
        .required(),
    sets: joi.array()
        .items(string().length(OBJECTID_LENGTH))
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

const create_response = joi.object({
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
    players: array()
        .items(player)
        .min(1)
        .required(),
    ownerID: joi.string()
        .length(OBJECTID_LENGTH)
        .required()
});

const join_request = joi.object({
    game_id: joi.string()
        .length(OBJECTID_LENGTH)
        .required(),
    player_name: joi.string()
        .min(2)
        .max(30)
        .required()
});

const join_response = joi.object({
    game_id: joi.string()
        .length(OBJECTID_LENGTH)
        .required(),
    player_list: joi.array()
        .items(player)
        .required()
});



module.exports = {
    check: check,
    incoming_message: incoming_message,
    white_card: white_card,
    player: player,
    create_request: create_request,
    create_response: create_response,
    join_request: join_request,
    join_response: join_response
};