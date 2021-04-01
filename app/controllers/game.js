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

  async getGame(req, res) {
    try {
      const {body} = req;
      const result = await this.gameService.getGame(body);

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

  //getHand
  async getHand(req, res) {
    try {
      const {body} = req;
      const result = await this.gameService.getHand(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }

  //getRound
  async getRound(req, res) {
    try {
      const {body} = req;
      const result = await this.gameService.getRound(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }

  //getLatestRound
  async getLatestRound(req, res) {
    try {
      const {body} = req;
      const result = await this.gameService.getLatestRound(body);

      res.send(result);
    } catch (err) {
      this.log.error(err.message);
      res.send(err);
    }
  }

  //selectCandidateCard
  async selectCandidateCard(req, res) {
    try {
      const {body} = req;
      const result = await this.gameService.selectCandidateCard(body);

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
  
  async getAllSets(req, res) {
    try {
      const result = await this.gameService.getAllSets();

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
  
}

module.exports = GameController;
