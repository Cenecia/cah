'use strict';

const config = require('../configs/configs');
const serviceLocator = require('../lib/service_locator');
const mongoose = serviceLocator.get('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Users', userSchema);