'use strict';

const joi = require('joi');

module.exports = joi.object().keys({
  email: joi.string().email().required()
}).required();