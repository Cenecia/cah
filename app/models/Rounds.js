'use strict';

const config = require('../configs/configs');
const Player = require('./Players');
const WhiteCard = require('./WhiteCards');
const BlackCard = require('./BlackCards');
const serviceLocator = require('../lib/service_locator');
const mongoose = serviceLocator.get('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const candidateCardSchema = new mongoose.Schema({
  player: { type: ObjectId, required: true, ref: "Players", get: v => v.toString() },
  cards: [{ type: String }],
  winner: { type: Boolean, default: false },
  playerName: { type: String }
});

const roundSchema = new mongoose.Schema({
  players: [{ type: ObjectId, required: true, ref: "Players", get: v => v.toString() }],
  status: { type: String },
  game: { type: ObjectId, required: true, ref: "Games", get: v => v.toString() },
  blackCard: { type: ObjectId, required: true, ref: "BlackCards", get: v => v.toString() },
  candidateCards: [candidateCardSchema],
  czar: { type: ObjectId, required: true, ref: "Players", get: v => v.toString() },
  winner: { type: ObjectId, required: false, ref: "Players", get: v => v.toString() },
  startTime: { type: Date }
});

roundSchema.set('toObject', { getters: true });
candidateCardSchema.set('toObject', { getters: true });

module.exports = mongoose.model('Rounds', roundSchema);