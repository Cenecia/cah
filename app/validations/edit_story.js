'use strict';

const joi = require('joi');

module.exports = joi.object().keys({
  _id: joi.string().required(),
  title: joi.string().required()
}).required();

//egex(/^[a-z]+$/