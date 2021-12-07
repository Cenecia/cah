'use strict';

const serviceLocator = require('../lib/service_locator');
const config = require('./configs')();

serviceLocator.register('logger', () => {
  return require('../lib/logger').create(config.application_logging);
});

serviceLocator.register('httpStatus', () => {
  return require('http-status');
});

serviceLocator.register('mongoose', () => {
  return require('mongoose');
});

serviceLocator.register('errs', () => {
  return require('restify-errors');
});

serviceLocator.register('gameService', (serviceLocator) => {
    const log = serviceLocator.get('logger');
    const mongoose = serviceLocator.get('mongoose');
    const httpStatus = serviceLocator.get('httpStatus');
    const errs = serviceLocator.get('errs');
    const GameService = require('../services/game');

    return new GameService(log, mongoose, httpStatus, errs);
});

serviceLocator.register('socketService', (serviceLocator) => {
    const log = serviceLocator.get('logger');
    const wsd = require('../lib/ws_dispatcher');
    const gameService = serviceLocator.get('gameService');

    return new wsd.WS_Dispatcher(log, gameService, config.websockets.port);
});

serviceLocator.register('gameController', (serviceLocator) => {
    const log = serviceLocator.get('logger');
    const httpStatus = serviceLocator.get('httpStatus');
    const gameService = serviceLocator.get('gameService');
    const socketService = serviceLocator.get('socketService');
    const GameController = require('../controllers/game');

    return new GameController(log, gameService, httpStatus, socketService);
});

module.exports = serviceLocator;