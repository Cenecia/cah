'use strict';

const config = require('../configs/configs');
const serviceLocator = require('../lib/service_locator');
//const WhiteCard = require('./WhiteCards');
const mongoose = serviceLocator.get('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// const playerSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   hand: [ WhiteCard ]
// });

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hand: [{ type: ObjectId, required: true, ref: "WhiteCards" }],
  points: { type: Number }
});

module.exports = mongoose.model('Players', playerSchema);