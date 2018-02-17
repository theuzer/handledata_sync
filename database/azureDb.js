const sql = require('mssql');

const logConfig = {
  server: process.env.DB_LOG_SERVER || "testserver-logdata.database.windows.net",
  database: process.env.DB_LOG_DATABASE || "MyDatabase",
  user: process.env.DB_LOG_USERNAME || "david",
  password: process.env.DB_LOG_PASSWORD || "Admin123",
  port: 1433,
  options: { encrypt: true },
};

const dataConfig = {
  server: process.env.DB_DATA_SERVER || "testserver-handledata.database.windows.net",
  database: process.env.DB_DATA_DATABASE || "Data",
  user: process.env.DB_DATA_USERNAME || "david",
  password: process.env.DB_DATA_PASSWORD || "Admin123",
  port: 1433,
  options: { encrypt: true },
};

const logConnection = new sql.ConnectionPool(logConfig);

const dataConnection = new sql.ConnectionPool(dataConfig);

exports.logConnection = logConnection;

exports.dataConnection = dataConnection;
