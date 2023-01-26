'use strict';

const config = require('../configs/configs');
const serviceLocator = require('../lib/service_locator');
const mongoose = serviceLocator.get('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hand: [{ type: ObjectId, required: true, ref: "WhiteCards" }],
  points: { type: Number },
  active: { type: Boolean },
  mulligans: { type: Number },
  guid: { type: String }
});

module.exports = mongoose.model('Players', playerSchema);