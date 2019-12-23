'use strict';

module.exports = () => ({
  cryptotest: () => {
    console.log("test 10");
  },
  encrypt: (salt, password) => {
    const crypto = require('crypto');
    let key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    return key.toString('hex');
  }
});