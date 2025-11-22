'use strict';

require('dotenv').config();
const config = require('./app/configs/configs')();
const restify = require('restify');

const joi = require('joi');
const corsMiddleware = require('restify-cors-middleware2'); // --- 1. REQUIRE THE PACKAGE ---

// Require DI
const serviceLocator = require('./app/configs/di');
const validator = require('./app/lib/validator');
const handler = require('./app/lib/error_handler');
const routes = require('./app/routes/routes');
const logger = serviceLocator.get('logger');

const server = restify.createServer({
  name: config.app.name
});

// Initialize the database
const Database = require('./app/configs/database');
new Database(config.mongo.port, config.mongo.host, config.mongo.name);

//CORS Middleware Setup
const cors = corsMiddleware({
  origins: ['*'], // Allow all origins for local testing
  allowHeaders: ['Authorization'], // Customize allowed headers
  exposeHeaders: ['Authorization'] // Customize exposed headers
});

// Handle Pre-flight OPTIONS requests
server.pre(cors.preflight);
// Handle the actual CORS requests
server.use(cors.actual);

// Set API versioning and allow trailing slashes
server.pre(restify.pre.sanitizePath());

// Set request handling and parsing
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.jsonBodyParser({ mapParams: true }));
server.use(restify.plugins.urlEncodedBodyParser({ mapParams: true }));

// initialize validator for all requests
server.use(validator.paramValidation(logger, joi));

// Setup Error Event Handling
handler.register(server);

// Setup route Handling
routes.register(server, serviceLocator);

// start server
server.listen(config.app.port, () => {
  console.log(`${config.app.name} Server is running on port -
    ${config.app.port}`);
});