'use strict';

module.exports.register = (server, serviceLocator) => {

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