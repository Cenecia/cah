'use strict';

const config = require('../configs/configs');
const Player = require('./Players');
const Round = require('./Rounds');
const WhiteCard = require('./WhiteCards');
const BlackCard = require('./BlackCards');
const serviceLocator = require('../lib/service_locator');
const mongoose = serviceLocator.get('mongoose');

const gameSchema = new mongoose.Schema({
  players: [ Player ],
  rounds: [ Round ],
  whiteCards: [ WhiteCard ],
  blackCards: [ BlackCard ],
  whiteCardDiscards: [ WhiteCard ],
  blackCardDiscards: [ BlackCard ]
});

module.exports = mongoose.model('Games', gameSchema);