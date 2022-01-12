'use strict';

module.exports = () => ({
  app: {
    name: process.env.APP_NAME,
    port: process.env.APP_PORT || 3000,
    environment: process.env.APPLICATION_ENV,
    logpath: process.env.LOG_PATH
  },
  mongo: {
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    name: process.env.DB_NAME
  },
  websockets: {
    port: process.env.WS_PORT,
    ssl_enabled: process.env.SSL_ENABLED,
    cert_file: process.env.SSL_CERT_FILE,
    key_file: process.env.SSL_KEY_FILE
  },
  application_logging: {
    file: process.env.LOG_PATH,
    level: process.env.LOG_LEVEL || 'info',
    console: process.env.LOG_ENABLE_CONSOLE || true
  }
});