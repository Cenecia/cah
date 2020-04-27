'use strict';

class GameService {
  constructor(log, mongoose, httpStatus, errs) {
    this.log = log;
    this.mongoose = mongoose;
    this.httpStatus = httpStatus;
    this.errs = errs;
  }

  //games/new
  async createGame(body) {
    const Games = this.mongoose.model('Games');
    const Players = this.mongoose.model('Players');
    const BlackCards = this.mongoose.model('BlackCards');
    const WhiteCards = this.mongoose.model('WhiteCards');
    
    let blackCardDeck = await BlackCards.find();
    let whiteCardDeck = await WhiteCards.find();

    let playerOne = new Players({
      name: body.player,
      hand: [],
      points: 0
    });
    playerOne = await playerOne.save();
    
    let newGame = new Games({
      players: [ playerOne._id ],
      blackCards: [],
      whiteCards: [],
      rounds: [],
      czar: -1
    });

    blackCardDeck.forEach(b => {
      newGame.blackCards.push(b._id);
    });

    whiteCardDeck.forEach(w => {
      newGame.whiteCards.push(w._id);
    });

    newGame = await newGame.save();
    newGame = await Games.findOne({_id: newGame._id}).populate('players');

    let returnMe = {
      whiteCardCount: newGame.whiteCards.length,
      blackCardCount: newGame.blackCards.length,
      gameID: newGame._id,
      players: newGame.players
    };

    this.log.info('New game created.');
    this.log.info(returnMe);

    return returnMe;
  }

  //games/join
  async joinGame(body) {
    const Games = this.mongoose.model('Games');
    const Players = this.mongoose.model('Players');
    const Rounds = this.mongoose.model('Rounds');

    let newPlayer = new Players({
      name: body.player,
      hand: [],
      points: 0
    });
    newPlayer = await newPlayer.save();
    
    let game = await Games.findOne({_id: body.gameID});
    game.players.push(newPlayer._id);
    game = await game.save();
    game = await Games.findOne({_id: body.gameID}).populate('players');

    let latestRound = await Rounds.findOne({game: body.gameID, status: "submit"}).populate('blackCard');

    let returnMe = {
      whiteCardCount: game.whiteCards.length,
      blackCardCount: game.blackCards.length,
      gameID: game._id,
      players: game.players,
      rounds: game.rounds,
      latestRound: latestRound
    };

    this.log.info('Player joined game.');
    this.log.info(returnMe);

    return returnMe;
  }

  async getGame(body){
    const Games = this.mongoose.model('Games');
   
    let game = await Games.findOne({_id: body.gameID}).populate('players');
    
    return game;
  }

  //games/startRound
  async startRound(body) {
    const Games = this.mongoose.model('Games');
    const Rounds = this.mongoose.model('Rounds');
    const Players = this.mongoose.model('Players');
    const BlackCards = this.mongoose.model('BlackCards');
    const handSize = 8;

    let game = await Games.findOne({_id: body.gameID});
    if(game.czar === game.players.length-1){
      game.czar = 0;
    } else {
      game.czar++;
    }
    let round = new Rounds({
      players: game.players,
      status: 'submit',
      game: game._id,
      blackCard: game.blackCards[Math.floor(Math.random()*game.blackCards.length)],
      candidateCards: [],
      czar: game.players[game.czar],
      startTime: new Date()
    });

    round = await round.save();
    //this.log.info(round.startTime);
    
    game.rounds.push(round);
    game.blackCards = game.blackCards.filter(e => e._id !== round.blackCard);

    //Give each player (handSize) white cards
    round.players.forEach(async p => {
      let player = await Players.findOne({_id: p});
      while(player.hand.length < handSize){
        let whiteCard = game.whiteCards[Math.floor(Math.random()*game.whiteCards.length)];
        player.hand.push(whiteCard);
        game.whiteCards = game.whiteCards.filter(e => e !== whiteCard);
      }
      player = await player.save();
    });
    game = await game.save();
    
    round = Rounds.findOne({_id: round._id}).populate('blackCard').populate('players').populate('game');

    return round;
  }

  //games/submitWhiteCard
  async submitWhiteCard (body){
    const Games = this.mongoose.model('Games');
    const Rounds = this.mongoose.model('Rounds');
    const Players = this.mongoose.model('Players');
    const WhiteCards = this.mongoose.model('WhiteCards');

    let round = await Rounds.findOne({_id: body.roundID});
    
    if(round.status !== 'submit'){
      //They somehow submitted a card after all cards were submitted
      this.log.info('All White Cards submitted');
      return 'All White Cards submitted';
    }

    if(round.candidateCards.some(card => card.player == body.playerID)){
      //They somehow submitted a 
      this.log.info('Already submitted a card');
      return 'Already submitted a card';
    }

    var candidateCards = [];
    
    //Get the white cards and add the text as a candidate card
    for (let index = 0; index < body.whiteCards.length; index++) {
      let candidateCard = await WhiteCards.findOne({_id:body.whiteCards[index]});
      candidateCards.push(candidateCard.text);
    }

    //this.log.info(candidateCards);

    //Add the candidate cards to the round, tied to the player
    round.candidateCards.push({
      player: body.playerID,
      cards: candidateCards
    });

    let game = await Games.findOne({_id: round.game});

    let player = await Players.findOne({_id: body.playerID});

    //remove the submitted white cards from the player's hand
    body.whiteCards.forEach(async whiteCard => {
      player.hand = player.hand.filter(o => o != whiteCard);
    });
    
    //If they were inactive, they are active now
    player.active = true;
    
    player = await player.save();

//     let now = new Date();
//     if((now - round.startTime) > 300000){
//       //Round time limit expired
//       //game.players.forEach()
//       round.status = 'select';
//     }
    if(round.candidateCards.length === round.players.length-1){
      round.status = 'select';
    }
    round = await round.save();

    round = await Rounds.findOne({_id: body.roundID}).populate('blackCard').populate('players').populate('game');
    return round;
  }
  
  //games/selectCandidateCard
  async selectCandidateCard (body){
    const Rounds = this.mongoose.model('Rounds');
    const Players = this.mongoose.model('Players');

    let round = await Rounds.findOne({_id: body.roundID}).populate('players').populate('game');
    if(round.status == 'select'){
      round.players.forEach(async player => {
        if(player._id == body.player){
          player.points++;
          let updatePlayer = await Players.findOne({_id: body.player}).populate('hand');
          updatePlayer.points++;
          updatePlayer = updatePlayer.save();
        }
      });
      round.candidateCards.forEach(candidate => {
        if(candidate.player == body.player){
          candidate.winner = true;
        }
      });
      round.winner = body.player;
      round.status = 'closed';
      round = await round.save();
      round = await Rounds.findOne({_id: body.roundID}).populate('players').populate('game').populate('winner');

      this.log.info('Winning Card Selected.');
    }
    return round;
  }

  //games/getHand
  async getHand (body){
    const Players = this.mongoose.model('Players');

    let player = await Players.findOne({_id: body.playerID}).populate('hand');
    this.log.info(player);

    return player;
  }

  //games/getRound
  async getRound (body){
    const Rounds = this.mongoose.model('Rounds');
    let now = new Date();

    let round = await Rounds.findOne({_id: body.roundID}).populate('blackCard').populate('players').populate('game').populate('winner');
    let diff = now - round.startTime;
    //this.log.info(diff);

    return round;
  }

  //games/getLatestRound
  async getLatestRound (body){
    const Rounds = this.mongoose.model('Rounds');
    const Games = this.mongoose.model('Games');
    //const Games = this.mongoose.model('Players');
    let game = await Games.findOne({_id: body.gameID});
    let latestRoundId = game.rounds[game.rounds.length - 1];
    let round = await Rounds.findOne({ _id: latestRoundId }).populate('blackCard').populate('players').populate('game').populate('winner');
    
    //Check if round timed out
    let now = new Date();
    let diff = now - round.startTime;
    //8,090,029
    if(round.status == "submit" && diff > 300000){
      round.status = 'select';
      round = await round.save();
    }

    return round;
  }

  async parseGame() {
    const https = require('https');
    //https://cah.greencoaststudios.com/api_reference/
    
    https.get('https://cah.greencoaststudios.com/api/v1/official', (resp) => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        let setdata = JSON.parse(data).packs;
        setdata.forEach(async s => {
          const Sets = this.mongoose.model('Sets'); 
          const exists = await Sets.findOne({set_id: s.id});
          
          if(exists){
            this.log.info(exists);
          } else {
            let newSet = new Sets({
              name: s.name,
              set_id: s.id
            });
            newSet = await newSet.save();
            this.log.info("New set found. Added "+s.name+".");
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
      https.get('https://cah.greencoaststudios.com/api/v1/official/'+s.set_id, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          //this.log.info(JSON.parse(data));
          let { white, black } = JSON.parse(data);
          
          const BlackCards = this.mongoose.model('BlackCards');
          const WhiteCards = this.mongoose.model('WhiteCards');
          
          black.forEach(async b => {
            //this.log.info(b.content);
            const exists = await BlackCards.findOne({set: s._id, text: b.content});
            if(exists){
              this.log.info("Black Card exists");
            } else {
              this.log.info("New Black Card found. Added "+b.content+".");
              let blackCard = new BlackCards({
                set: s._id,
                text: b.content,
                pick: b.pick
              });
              blackCard = await blackCard.save();
            }
          });
          
          white.forEach(async w => {
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