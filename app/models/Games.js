'use strict';

const config = require('../configs/configs');
const serviceLocator = require('../lib/service_locator');
const mongoose = serviceLocator.get('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// const gameSchema = new mongoose.Schema({
//   players: [ Player ],
//   rounds: [ Round ],
//   whiteCards: [ WhiteCard ],
//   blackCards: [ BlackCard ],
//   whiteCardDiscards: [ WhiteCard ],
//   blackCardDiscards: [ BlackCard ]
// });

const gameSchema = new mongoose.Schema({
  players: [{ type: ObjectId, required: true, ref: "Players" }],
  whiteCards: [{ type: ObjectId, required: true, ref: "WhiteCards" }],
  blackCards: [{ type: ObjectId, required: true, ref: "BlackCards" }],
  rounds: [{ type: ObjectId, required: true, ref: "Rounds" }],
  czar: Number,
  owner: { type: ObjectId, required: true, ref: "Players" }
});

module.exports = mongoose.model('Games', gameSchema);