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
    
    //this.log.info(body.sets);
    //return;
    let sets = body.sets;
    let timeLimit = body.time_limit * 60 * 1000;
    
    let blackCardDeck = await BlackCards.find({ set: { $in: sets } });
    let whiteCardDeck = await WhiteCards.find({ set: { $in: sets } });

    let playerOne = new Players({
      name: body.player,
      hand: [],
      points: 0,
      active: true
    });
    playerOne = await playerOne.save();
    
    let newGame = new Games({
      players: [ playerOne._id ],
      blackCards: [],
      whiteCards: [],
      rounds: [],
      czar: -1,
      timeLimit: timeLimit
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
      points: 0,
      active: true
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

    this.log.info(newPlayer.name+' joined game.');
    //this.log.info(returnMe);

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

    let game = await Games.findOne({_id: body.gameID}).populate('players');
    
    //Make sure the game has no rounds, or the latest round is 'closed'
    let latestRoundId = game.rounds[game.rounds.length - 1];
    
    let latestRound = await Rounds.findOne({ _id: latestRoundId });
    if(latestRound && latestRound.status != 'closed'){
      this.log.info('Cannot start next round. Current round incomplete');
      return;
    }
    
    do {
      if(game.czar === game.players.length-1){
        game.czar = 0;
      } else {
        game.czar++;
      }
    } while (!game.players[game.czar].active);
    
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
    
    //Count white cards we need to distribute
    let newWhiteCardCount = 0;
    round.players.forEach(p => {
      newWhiteCardCount += handSize - p.hand.length;
    });
    
    let newWhiteCards = [];
    let possibleWhiteCards = [];
    
    //Take the number of white cards we need out of the game's whitecard deck
    for (var index = 0; index < newWhiteCardCount; index++) {
      possibleWhiteCards = game.whiteCards.filter(wc => !newWhiteCards.some(nwc => nwc == wc));
      this.log.info(`possibleWhiteCards IN LOOP: ${possibleWhiteCards.length}`);
      newWhiteCards.push(possibleWhiteCards[Math.floor(Math.random()*possibleWhiteCards.length)]);
    }
    
    //newWhiteCards is now all the cards we will give back to players
    //possibleWhiteCards is all the remaining whitecards in the deck
    game.whiteCards = possibleWhiteCards.filter(wc => !newWhiteCards.some(nwc => nwc == wc));
    this.log.info(`game.whitecards: ${game.whiteCards.length} possibleWhiteCards: ${possibleWhiteCards.length} newWhiteCards: ${newWhiteCards.length}`);
    game = await game.save();

    //Give each player (handSize) white cards
    round.players.forEach(async p => {
      let player = await Players.findOne({_id: p});
      while(player.hand.length < handSize){
        let whiteCard = newWhiteCards[Math.floor(Math.random()*newWhiteCards.length)];
        player.hand.push(whiteCard);
        newWhiteCards = newWhiteCards.filter(e => e !== whiteCard);
      }
      player = await player.save();
    });
    
    round = Rounds.findOne({_id: round._id}).populate('blackCard').populate('players').populate('game');

    return round;
  }

  //games/submitWhiteCard
  async submitWhiteCard (body){
    const Games = this.mongoose.model('Games');
    const Rounds = this.mongoose.model('Rounds');
    const Players = this.mongoose.model('Players');
    const WhiteCards = this.mongoose.model('WhiteCards');

    let round = await Rounds.findOne({_id: body.roundID}).populate('players');
    
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
      this.log.info('White card submitted');
      let candidateCard = await WhiteCards.findOne({_id:body.whiteCards[index]});
      candidateCards.push(candidateCard.text);
    }

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

    let allCardsSubmitted = true;
    //Loop through every active player who isn't the czar
    round.players.filter(p => p.active && p._id.toString() != round.czar.toString()).forEach(async p => {
        //Check if each player in the loop has submitted a card. One false here will falsify the rest
       allCardsSubmitted = allCardsSubmitted && round.candidateCards.some(c => c.player.toString() == p._id.toString());
    });
    if(allCardsSubmitted){
      this.log.info('All active players submitted card. Next phase');
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
    //this.log.info(player);

    return player;
  }

  //games/getRound
  async getRound (body){
    const Rounds = this.mongoose.model('Rounds');
    let now = new Date();

    let round = await Rounds.findOne({_id: body.roundID}).populate('blackCard').populate('players').populate('game').populate('winner');

    return round;
  }

  //games/getLatestRound
  async getLatestRound (body){
    const Rounds = this.mongoose.model('Rounds');
    const Games = this.mongoose.model('Games');
    const Players = this.mongoose.model('Players');
    //const Games = this.mongoose.model('Players');
    let game = await Games.findOne({_id: body.gameID});
    let latestRoundId = game.rounds[game.rounds.length - 1];
    
    //Need to figure out a way to include candidateCards here
    let round = await Rounds.findOne({ _id: latestRoundId }).populate('blackCard').populate('players').populate('game').populate('winner');
    
    //Check if round timed out
    let now = new Date();
    let diff = now - round.startTime;
    
    if(round.status == "submit" && diff > game.timeLimit){
      let inactives = [];
      this.log.info('Time limit hit. Next phase');

      round.players.filter(p => p._id.toString() != round.czar.toString()).forEach(async p => {
        let player = await Players.findOne({ _id: p._id });
        player.active = round.candidateCards.some(c => c.player.toString() == p._id.toString());
        player = await player.save();
      });
      round.status = 'select';
      round = await round.save();
    }

    return round;
  }
  
  async getAllSets(){
    const Sets = this.mongoose.model('Sets');
    const BlackCards = this.mongoose.model('BlackCards');
    const WhiteCards = this.mongoose.model('WhiteCards');
    
    let blackCardDeck = await BlackCards.find().populate('set');
    let whiteCardDeck = await WhiteCards.find().populate('set');
    
    let sets = [];
    
    blackCardDeck.forEach(bc => {
      if(!sets.some(s => s.id.toString() == bc.set._id.toString())){
        sets.push({
          id: bc.set._id.toString(),
          name: bc.set.name,
          blackCardCount: 1,
          whiteCardCount: 0
        })
      } else {
        sets.find(s => s.id.toString() == bc.set._id.toString()).blackCardCount++;
      }
    });
    
    whiteCardDeck.forEach(wc => {
      if(!sets.some(s => s.id.toString() == wc.set._id.toString())){
        sets.push({
          id: wc.set._id.toString(),
          name: wc.set.name,
          blackCardCount: 0,
          whiteCardCount: 1
        })
      } else {
        sets.find(s => s.id.toString() == wc.set._id.toString()).whiteCardCount++;
        //sets.find(s => s.name == wc.set.name).wcid = wc.set._id;
      }
    });
    
    //this.log.info(sets);
    
    return sets;
    
//     await Sets.find({}, function (err, docs){
//       docs.forEach(async sl => {
//         let blackCardCount = await BlackCards.estimatedDocumentCount({ set: sl._id });
//         docs.test = blackCardCount;
//       });
//       console.log(docs);
//     });
    
    //this.log.info(setList);
    
//     let returnSets = [];
    
//     setList.forEach(async sl => {
//       let blackCardCount = await BlackCards.estimatedDocumentCount({ set: sl._id });
//       let whiteCardCount = await WhiteCards.estimatedDocumentCount({ set: sl._id });
//       sl.whiteCardCount = whiteCardCount;
// //       this.log.info({
// //           name: sl.name,
// //           id: sl._id,
// //           blackCards: blackCardCount,
// //           whiteCards: whiteCardCount
// //         });
// //       returnSets.push(
// //         {
// //           name: sl.name,
// //           id: sl._id,
// //           blackCards: blackCardCount,
// //           whiteCards: whiteCardCount
// //         }
// //       )
//     });
    
//     //this.log.info(returnSets);
    
//     return setList;
  }
  
  async getAllCards(){
    const BlackCards = this.mongoose.model('BlackCards');
    const WhiteCards = this.mongoose.model('WhiteCards');
    
    let sets = ["5ea262f38ff879045230f611","5ea262f38ff879045230f610"];
    
    let blackCardDeck = await BlackCards.find().populate('set');
    let whiteCardDeck = await WhiteCards.find({ set: { $in: sets } }).populate('set');
    
    let filteredWhiteCards = [];
    whiteCardDeck.forEach(card => {
      if(!filteredWhiteCards.some(c => c.text == card.text)){
        filteredWhiteCards.push(card);
      }
    });
    
    return {
      whiteCardDeck: filteredWhiteCards,
      blackCardDeck: blackCardDeck
    }
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