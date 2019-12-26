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

  async parseGame() {
    const https = require('https');

    https.get('https://cards-against-humanity-api.herokuapp.com/sets', (resp) => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        const Sets = this.mongoose.model('Sets'); 
        //this.log.info(data);
        JSON.parse(data).forEach(async s => {
          const exists = await Sets.findOne({name: s.setName});
          if(exists){
            this.log.info(exists);
          } else {
            let newSet = new Sets({
              name: s.setName
            });
            newSet = await newSet.save();
            this.log.info("New set found. Added "+s.setName+".");
          }
        });
      });

    }).on("error", (err) => {
      this.log.info("Error: " + err.message);
    });

    return "Sets added";
  }
}

module.exports = GameService;