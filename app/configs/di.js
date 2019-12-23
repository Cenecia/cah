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

serviceLocator.register('userService', (serviceLocator) => {
    const log = serviceLocator.get('logger');
    const mongoose = serviceLocator.get('mongoose');
    const httpStatus = serviceLocator.get('httpStatus');
    const errs = serviceLocator.get('errs');
    const UserService = require('../services/user');
    //const crypto = require('../middlewares/crypto');

    return new UserService(log, mongoose, httpStatus, errs);
});

serviceLocator.register('userController', (serviceLocator) => {
    const log = serviceLocator.get('logger');
    const httpStatus = serviceLocator.get('httpStatus');
    const userService = serviceLocator.get('userService');
    const UserController = require('../controllers/user');

    return new UserController(log, userService, httpStatus);
});

serviceLocator.register('storyService', (serviceLocator) => {
    const log = serviceLocator.get('logger');
    const mongoose = serviceLocator.get('mongoose');
    const httpStatus = serviceLocator.get('httpStatus');
    const errs = serviceLocator.get('errs');
    const StoryService = require('../services/story');
    const storySchema = require('../models/Stories');

    return new StoryService(log, mongoose, httpStatus, errs, storySchema);
});

serviceLocator.register('storyController', (serviceLocator) => {
    const log = serviceLocator.get('logger');
    const httpStatus = serviceLocator.get('httpStatus');
    const storyService = serviceLocator.get('storyService');
    const StoryController = require('../controllers/story');

    return new StoryController(log, storyService, httpStatus);
});

serviceLocator.register('pageService', (serviceLocator) => {
    const log = serviceLocator.get('logger');
    const mongoose = serviceLocator.get('mongoose');
    const httpStatus = serviceLocator.get('httpStatus');
    const errs = serviceLocator.get('errs');
    const PageService = require('../services/page');
    const pageSchema = require('../models/Pages');
    const buttonSchema = require('../models/Buttons');

    return new PageService(log, mongoose, httpStatus, errs, pageSchema, buttonSchema);
});

serviceLocator.register('pageController', (serviceLocator) => {
    const log = serviceLocator.get('logger');
    const httpStatus = serviceLocator.get('httpStatus');
    const pageService = serviceLocator.get('pageService');
    const PageController = require('../controllers/page');

    return new PageController(log, pageService, httpStatus);
});

serviceLocator.register('cryptoMiddleware', (serviceLocator) => {
    const log = serviceLocator.get('logger');  
    const crypto = require('../middlewares/crypto');

    return new crypto(log);
});

module.exports = serviceLocator;