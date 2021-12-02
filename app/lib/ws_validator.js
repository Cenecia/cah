const joi = require("joi");

const OBJECTID_LENGTH = 24; //twelve hexadecimal bytes
/*const whiteCardSchema = new mongoose.Schema({
  set: { type: ObjectId, required: true, ref: "Sets" },
  text: { type: String },
  blankCard: { type: Boolean, default: false }
});
*/
const white_card_schema = joi.object({
    set: joi.string()
        .length(OBJECTID_LENGTH)
        .required(),
    text: joi.string()
        .min(1)
        .required(),
    is_blank: joi.boolean()
        .required()
});

const player_schema = joi.object({
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
});


const join_request_schema = joi.object({
    game_id: joi.string()
        .length(OBJECTID_LENGTH)
        .required()
});

const join_response_schema = join.object({
    game_id: joi.string()
        .length(OBJECTID_LENGTH)
        .required(),
    player_list: joi.array(player_schema)
        .required()
});

