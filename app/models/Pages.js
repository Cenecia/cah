'use strict';

const config = require('../configs/configs');
const serviceLocator = require('../lib/service_locator');
const buttonSchema = require('./Buttons');
const mongoose = serviceLocator.get('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const pageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  story: { type: ObjectId, required: true, ref: "Stories" },
  buttons: [ buttonSchema ]
});

module.exports = pageSchema;