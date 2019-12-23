'use strict';

class UserController {
  constructor(log, userService, httpStatus) {
    this.log = log;
    this.userService = userService;
    this.httpStatus = httpStatus;
  }

  async create(req, res) {
    try {
      const {body} = req;
      const result = await this.userService.createUser(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }

  async get(req, res) {
    try {
      const {email} = req.params;
      const result = await this.userService.getUser(email);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }

  async delete(req, res) {
    try {
      const {body} = req;
      const result = await this.userService.deleteUser(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }

  async auth(req, res) {
    try {
      const {body} = req;
      const result = await this.userService.authUser(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }
}

module.exports = UserController;