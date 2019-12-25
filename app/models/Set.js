'use strict';

const config = require('../configs/configs');
const serviceLocator = require('../lib/service_locator');
const mongoose = serviceLocator.get('mongoose');

const setSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

module.exports = mongoose.model('Sets', setSchema);