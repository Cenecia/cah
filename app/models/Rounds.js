'use strict';

const config = require('../configs/configs');
const Player = require('./Players');
const WhiteCard = require('./WhiteCards');
const BlackCard = require('./BlackCards');
const serviceLocator = require('../lib/service_locator');
const mongoose = serviceLocator.get('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const candidateCardSchema = new mongoose.Schema({
  player: { type: ObjectId, required: true, ref: "Players" },
  cards: [{ type: String }]
});

const roundSchema = new mongoose.Schema({
  players: [{ type: ObjectId, required: true, ref: "Players" }],
  status: { type: String },
  game: { type: ObjectId, required: true, ref: "Games" },
  blackCard: { type: ObjectId, required: true, ref: "BlackCards" },
  candidateCards: [candidateCardSchema],
  czar: { type: ObjectId, required: true, ref: "Players" },
  winner: { type: ObjectId, required: false, ref: "Players" }
});

module.exports = mongoose.model('Rounds', roundSchema);