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
    const BlackCards = this.mongoose.model('BlackCards');
    const WhiteCards = this.mongoose.model('WhiteCards');
    
    let blackCardDeck = await BlackCards.find();
    let whiteCardDeck = await WhiteCards.find();

    let playerOne = new Players({
      name: body.player
    });
    playerOne = await playerOne.save();
    
    let newGame = new Games({
      players: [ playerOne._id ],
      blackCards: [],
      whiteCards: [],
      rounds: []
    });

    blackCardDeck.forEach(b => {
      newGame.blackCards.push(b._id);
    });

    whiteCardDeck.forEach(w => {
      newGame.whiteCards.push(w._id);
    });

    newGame = await newGame.save();

    return {
      whiteCardCount: newGame.whiteCards.length,
      blackCardCount: newGame.blackCards.length,
      gameID: newGame._id,
      players: newGame.players
    };
  }

  async joinGame(body) {
    const Games = this.mongoose.model('Games');
    const Players = this.mongoose.model('Players');

    let newPlayer = new Players({
      name: body.player
    });
    newPlayer = await newPlayer.save();
    
    let game = await Games.findOne({_id: body.gameID});
    game.players.push(newPlayer._id);
    game = await game.save();

    return {
      whiteCardCount: game.whiteCards.length,
      blackCardCount: game.blackCards.length,
      gameID: game._id,
      players: game.players
    };
  }

  async startRound(body) {
    const Games = this.mongoose.model('Games');
    const Rounds = this.mongoose.model('Rounds');

    let game = await Games.findOne({_id: body.gameID});
    let round = new Rounds({
      players: game.players,
      status: 'submit',
      game: game._id,
      blackCard: game.blackCards[Math.floor(Math.random()*game.blackCards.length)],
      submittedWhiteCards: []
    });

    round = await round.save();

    game.rounds.push(round);
    game = await game.save();

    return round;
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

  async parseCards() {
    const https = require('https');
    const Sets = this.mongoose.model('Sets'); 
    let allSets = await Sets.find();
    allSets.forEach(s => {
      https.get('https://cards-against-humanity-api.herokuapp.com/sets/'+s.name, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          const BlackCards = this.mongoose.model('BlackCards');
          const WhiteCards = this.mongoose.model('WhiteCards');
          let { blackCards, whiteCards } = JSON.parse(data);
          
          blackCards.forEach(async b => {
            const exists = await BlackCards.findOne({set: s._id, text: b.text});
            if(exists){
              this.log.info("Black Card exists");
            } else {
              this.log.info("New Black Card found. Added "+b.text+".");
              let blackCard = new BlackCards({
                set: s._id,
                text: b.text,
                pick: b.pick
              });
              blackCard = await blackCard.save();
            }
          });

          whiteCards.forEach(async w => {
            const exists = await WhiteCards.findOne({set: s._id, text: w});
            if(exists){
              this.log.info("White Card exists");
            } else {
              this.log.info("New White Card found. Added "+w+".");
              let whiteCard = new WhiteCards({
                set: s._id,
                text: w
              });
              whiteCard = await whiteCard.save();
            }
          });
        });

      }).on("error", (err) => {
        this.log.info("Error: " + err.message);
      });
    });

    return "Let's add some cards.";
  }
}

module.exports = GameService;