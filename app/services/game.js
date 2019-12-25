'use strict';

class GameService {
  constructor(log, mongoose, httpStatus, errs) {
    this.log = log;
    this.mongoose = mongoose;
    this.httpStatus = httpStatus;
    this.errs = errs;
  }

  async createGame(body) {
    //const Stories = this.mongoose.model('Stories',this.storySchema);
    // let newStory = new Stories({
    //   title: body.title,
    //   owner: body.owner
    // });
    // newStory = await newStory.save();
    let newGame = {
      _id: "12345"
    };

    this.log.info('I wanna play a game...');
    return newGame;
  }
}

module.exports = GameService;