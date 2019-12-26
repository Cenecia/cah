'use strict';

const serviceLocator = require('../lib/service_locator');
const logger = serviceLocator.get('logger');

class Database {
  constructor(port, host, name) {
    this.mongoose = serviceLocator.get('mongoose');
    this._connect(port, host, name);
  }

  _connect(port, host, name) {
    this.mongoose.Promise = global.Promise;
    this.mongoose.connect(`mongodb://${host}:${port}/${name}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    const {connection} = this.mongoose;
    connection.on('connected', () =>
      logger.info('Database Connection was Successful')
    );
    connection.on('error', (err) =>
      logger.info('Database Connection Failed' + err)
    );
    connection.on('disconnected', () =>
      logger.info('Database Connection Disconnected')
    );
    process.on('SIGINT', () => {
      connection.close();
      logger.info(
        'Database Connection closed due to NodeJs process termination'
      );
      process.exit(0);
    });

    // initialize Models
    require('../models/Games');
    require('../models/Players');
    require('../models/Sets');
    require('../models/WhiteCards');
    require('../models/BlackCards');
    require('../models/Rounds');
  }
}

module.exports = Database;