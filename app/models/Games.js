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
  blackRemaining: Number,
  whiteRemaining: Number,
  rounds: [{ type: ObjectId, required: true, ref: "Rounds" }],
  handSize: Number,
  czar: Number,
  timeLimit: Number,
  scoreLimit: Number,
  playerLimit: Number,
  winner: { type: ObjectId, required: false, ref: "Players" },
  name: String,
  sets: [String]
});

module.exports = mongoose.model('Games', gameSchema);