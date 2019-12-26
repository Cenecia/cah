'use strict';

const config = require('../configs/configs');
const serviceLocator = require('../lib/service_locator');
const mongoose = serviceLocator.get('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const whiteCardSchema = new mongoose.Schema({
  set: { type: ObjectId, required: true, ref: "Sets" },
  text: { type: String }
});

module.exports = mongoose.model('WhiteCards', whiteCardSchema);