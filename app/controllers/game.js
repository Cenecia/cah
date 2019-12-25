'use strict';

class GameController {
  constructor(log, gameService, httpStatus) {
    this.log = log;
    this.gameService = gameService;
    this.httpStatus = httpStatus;
  }

  async create(req, res) {
    try {
      const {body} = req;
      const result = await this.gameService.createGame(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }
}

module.exports = GameController;
