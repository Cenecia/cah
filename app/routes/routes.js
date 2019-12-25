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
 
};