'use strict';

const joi = require('joi');

module.exports = joi.object().keys({
  player: joi.string().min(3).max(30).required()
}).required();