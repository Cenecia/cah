'use strict';

class GameService {
  constructor(log, mongoose, httpStatus, errs) {
    this.log = log;
    this.mongoose = mongoose;
    this.httpStatus = httpStatus;
    this.errs = errs;
  }

  async createGame(body) {
    const Games = this.mongoose.model('Games');
    const Players = this.mongoose.model('Players');

    let playerOne = new Players({
      name: body.player
    });
    playerOne = await playerOne.save();
    
    let newGame = new Games({
      players: [ playerOne._id ]
    });
    newGame = await newGame.save();

    this.log.info('Game On!');
    return newGame;
  }
}

module.exports = GameService;