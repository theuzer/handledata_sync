const sql = require('mssql');

const logConfig = {
  server: process.env.DB_LOG_SERVER,
  database: process.env.DB_LOG_DATABASE,
  user: process.env.DB_LOG_USERNAME,
  password: process.env.DB_LOG_PASSWORD,
  port: 1433,
  options: { encrypt: true },
  requestTimeout: 60000,
  pool: {
    max: 100,
    min: 0,
    idleTimeoutMillis: 120000,
  },
};

const dataConfig = {
  server: process.env.DB_DATA_SERVER,
  database: process.env.DB_DATA_DATABASE,
  user: process.env.DB_DATA_USERNAME,
  password: process.env.DB_DATA_PASSWORD,
  port: 1433,
  options: { encrypt: true },
  requestTimeout: 60000,
  pool: {
    max: 100,
    min: 0,
    idleTimeoutMillis: 120000,
  },
};

const logConnection = new sql.ConnectionPool(logConfig);
const dataConnection = new sql.ConnectionPool(dataConfig);

exports.logConnection = logConnection;
exports.dataConnection = dataConnection;
