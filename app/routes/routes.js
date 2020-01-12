'use strict';



module.exports.register = (server, serviceLocator) => {

  const io = require('socket.io')({
    path: '/test',
    serveClient: false,
  });
  
  server.post(
    {
      path: '/games/new',
      name: 'Create Game',
      version: '1.0.0',
      validation: {
        body: require('../validations/create_game')
      }
    },
    (req, res, next) => {
      serviceLocator.get('gameController').create(req, res, next)
    }
  );

  server.post(
    {
      path: '/games/join',
      name: 'Join Game',
      version: '1.0.0',
      validation: {
        body: require('../validations/create_game')
      }
    },
    (req, res, next) => {
      serviceLocator.get('gameController').join(req, res, next)
    }
  );

  server.post(
    {
      path: '/games/startRound',
      name: 'Start New Round',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('gameController').startRound(req, res, next)
    }
  );

  server.post(
    {
      path: '/games/submitWhiteCard',
      name: 'Submit White Card',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('gameController').submitWhiteCard(req, res, next)
    }
  );

  //getHand
  server.post(
    {
      path: '/games/getHand',
      name: 'Get Player Hand',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('gameController').getHand(req, res, next)
    }
  );

  //getRound
  server.post(
    {
      path: '/games/getRound',
      name: 'Get a round in session',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('gameController').getRound(req, res, next)
    }
  );

  //getLatestRound
  server.post(
    {
      path: '/games/getLatestRound',
      name: 'Get latest round in a game',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('gameController').getLatestRound(req, res, next)
    }
  );

  server.post(
    {
      path: '/games/selectCandidateCard',
      name: 'Submit White Card',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('gameController').selectCandidateCard(req, res, next)
    }
  );

  server.get(
    {
      path: '/games/parse',
      name: 'Parse Sets from API',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('gameController').parse(req, res, next)
    }
  );

  server.get(
    {
      path: '/games/parseCards',
      name: 'Parse Cards from API',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('gameController').parseCards(req, res, next)
    }
  );
 
};