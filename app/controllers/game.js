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

  async join(req, res) {
    try {
      const {body} = req;
      const result = await this.gameService.joinGame(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }

  //startRound
  async startRound(req, res) {
    try {
      const {body} = req;
      const result = await this.gameService.startRound(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }

  //submitWhiteCard
  async submitWhiteCard(req, res) {
    try {
      const {body} = req;
      const result = await this.gameService.submitWhiteCard(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }

  //selectBlackCard
  async selectBlackCard(req, res) {
    try {
      const {body} = req;
      const result = await this.gameService.selectBlackCard(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }

  //parseGame
  async parse(req, res) {
    try {
      const result = await this.gameService.parseGame();

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }

  //parseCards
  async parseCards(req, res) {
    try {
      const result = await this.gameService.parseCards();

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }
}

module.exports = GameController;
