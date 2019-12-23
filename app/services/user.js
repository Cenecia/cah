'use strict';

class UserService {
  constructor(log, mongoose, httpStatus, errs) {
    this.log = log;
    this.mongoose = mongoose;
    this.httpStatus = httpStatus;
    this.errs = errs;
    //this.crypto = crypto;
  }

  async createUser(body) {
    const Users = this.mongoose.model('Users');
    const {email} = body;
    const user = await Users.findOne({email});

    if (user) {
      const err = new this.errs.InvalidArgumentError(
        'User with email already exists'
      );
      return err;
    }
    
    const crypto = require('../middlewares/crypto')();
    const config = require('../configs/configs')();
    let salt = crypto.encrypt(config.app.crypto_salt, new Date().toString());
    let salted_pw = crypto.encrypt(salt, body.password);

    let newUser = new Users({
      email: body.email,
      password: salted_pw,
      salt: salt
    });
    newUser = await newUser.save();

    this.log.info('User Created Successfully');
    return newUser;
  }

  async getUser(email) {
    const Users = this.mongoose.model('Users');
    const user = await Users.findOne({email});

    if (!user) {
      const err = new this.errs.NotFoundError(
        `User with username - ${email} does not exists`
      );
      return err;
    }

    this.log.info('User fetched Successfully');
    return user;
  }
  
  async deleteUser(body) {
    const Users = this.mongoose.model('Users');
    const {email} = body;
    const user = await Users.findOne({email});

    if (!user) {
      const err = new this.errs.NotFoundError(
        `User with username - ${email} does not exists`
      );
      return err;
    }

    this.log.info('User fetched Successfully');
    await Users.deleteOne({email});
    this.log.info('User deleted Successfully');
    return "removed user";
  }
  
  async authUser(body) {
    const Users = this.mongoose.model('Users');
    const {email} = body;
    const user = await Users.findOne({email});

    if (!user) {
      const err = new this.errs.NotFoundError(
        `Authentication failed`
      );
      return err;
    }
    
    const crypto = require('../middlewares/crypto')();
    const config = require('../configs/configs')();
    //let salt = crypto.encrypt(config.app.crypto_salt, new Date().toString());
    let salted_pw = crypto.encrypt(user.salt, body.password);
    if(salted_pw === user.password){
      this.log.info('Authentication successful');
      return user;
    } else {
      const err = new this.errs.NotFoundError(
        `Authentication failed`
      );
      return err;
    }
  }
}

module.exports = UserService;