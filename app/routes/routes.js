'use strict';



module.exports.register = (server, serviceLocator) => {



  server.post(
    {
      path: '/games/getGame',
      name: 'Get Game',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('gameController').getGame(req, res, next)
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

  server.post(
    {
      path: '/games/updateCard',
      name: 'Update Card',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('gameController').updateCard(req, res, next)
    }
  );
  
  server.post(
    {
      path: '/games/addCard',
      name: 'Add Card',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('gameController').addCard(req, res, next)
    }
  );
  
  server.get(
    {
      path: '/test/test',
      name: 'Parse Sets from API',
      version: '1.0.0'
    },
    (req, res, next) => {
      //serviceLocator.get('gameController').parse(req, res, next);
      return "Test!";
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
  
  server.get(
    {
      path: '/games/getAllCards',
      name: 'Get all cards',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('gameController').getAllCards(req, res, next)
    }
  );
  

  //getAllSets
  server.get(
    {
      path: '/games/getAllSets',
      name: 'Get all sets',
      version: '1.0.0'
    },
    (req, res, next) => {
      serviceLocator.get('gameController').getAllSets(req, res, next)
    }
  );
 
};