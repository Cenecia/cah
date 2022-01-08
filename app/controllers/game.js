'use strict';

class GameController {
  constructor(log, gameService, httpStatus) {
    this.log = log;
    this.gameService = gameService;
    this.httpStatus = httpStatus;
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
  
  //getAllCards
  async getAllCards(req, res) {
    try {
      const result = await this.gameService.getAllCards();

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }

  async updateCard(req, res) {
    try {
      const {body} = req;
      const result = await this.gameService.updateCard(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }
  
  async addCard(req, res) {
    try {
      const {body} = req;
      const result = await this.gameService.addCard(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }
  
}

module.exports = GameController;
