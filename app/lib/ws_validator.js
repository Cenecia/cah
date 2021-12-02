const joi = require("joi");

const OBJECTID_LENGTH = 24; //twelve hexadecimal bytes

const ws_schema = {
    validate: function(schema, data) {
        schema.validate(data);
    },

    white_card: joi.object({
        set: joi.string()
            .length(OBJECTID_LENGTH)
            .required(),
        text: joi.string()
            .min(1)
            .required(),
        is_blank: joi.boolean()
            .required()
    }),

    player: joi.object({
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
        hand: joi.array(white_card_schema)
            .required()
    }),


    join_request: joi.object({
        game_id: joi.string()
            .length(OBJECTID_LENGTH)
            .required()
    }),

    join_response: joi.object({
        game_id: joi.string()
            .length(OBJECTID_LENGTH)
            .required(),
        player_list: joi.array(player_schema)
            .required()
    })

}

module.exports = ws_schemas;