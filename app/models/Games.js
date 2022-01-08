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
  players: [{ type: ObjectId, required: true, ref: "Players", get: v => v.toString() }],
  whiteCards: [{ type: ObjectId, required: true, ref: "WhiteCards", get: v => v.toString() }],
  blackCards: [{ type: ObjectId, required: true, ref: "BlackCards", get: v => v.toString() }],
  rounds: [{ type: ObjectId, required: true, ref: "Rounds", get: v => v.toString() }],
  czar: Number,
  timeLimit: Number,
  scoreLimit: Number,
  winner: { type: ObjectId, required: false, ref: "Players"},
  name: String,
  owner: { type: ObjectId, required: true, ref: "Players", get: v => v.toString() }
});

gameSchema.set('toObject', { getters: true });

module.exports = mongoose.model('Games', gameSchema);