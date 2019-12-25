'use strict';

const config = require('../configs/configs');
const serviceLocator = require('../lib/service_locator');
const WhiteCard = require('./WhiteCards');
const mongoose = serviceLocator.get('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hand: [ WhiteCard ]
});

module.exports = mongoose.model('Players', playerSchema);