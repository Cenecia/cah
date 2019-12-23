'use strict';

const config = require('../configs/configs');
const serviceLocator = require('../lib/service_locator');
const mongoose = serviceLocator.get('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const buttonSchema = new mongoose.Schema({
  text: { type: String, required: true },
  linkTo: { type: ObjectId, required: true, ref: "Pages" }
});

module.exports = buttonSchema;