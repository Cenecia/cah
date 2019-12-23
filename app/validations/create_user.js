'use strict';

const joi = require('joi');

module.exports = joi.object().keys({
  email: joi.string().email().required(),
  password: joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
}).required();

//egex(/^[a-z]+$/