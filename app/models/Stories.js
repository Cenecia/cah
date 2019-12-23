'use strict';

const config = require('../configs/configs');
const serviceLocator = require('../lib/service_locator');
const mongoose = serviceLocator.get('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  owner: { type: ObjectId, required: true, ref: "Users" },
  createdDate: { type: Date, default: Date.now }
});

//module.exports = mongoose.model('Stories', storySchema);
module.exports = storySchema;