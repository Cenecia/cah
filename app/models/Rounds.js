'use strict';

const config = require('../configs/configs');
const Player = require('./Players');
const WhiteCard = require('./WhiteCards');
const BlackCard = require('./BlackCards');
const serviceLocator = require('../lib/service_locator');
const mongoose = serviceLocator.get('mongoose');

const roundSchema = new mongoose.Schema({
  players: [ Player ],
  status: { type: String },
  blackCard: { type: ObjectId, required: true, ref: "BlackCards" },
  submittedWhiteCards: [ WhiteCard ]
});

module.exports = mongoose.model('Rounds', roundSchema);