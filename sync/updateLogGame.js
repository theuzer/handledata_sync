const sql = require('mssql');

const logConnection = require('../database/azureDb').logConnection;
const constants = require('./constants');


exports.updateGameHasError = (id) => {
  new sql.Request(logConnection).query(constants.updateGameHasError(id))
    .catch((err) => {
      console.log(1, err);
    });
};

exports.updateGameAsProcessed = (id) => {
  new sql.Request(logConnection).query(constants.updateGameIsProcessed(id))
    .catch((err) => {
      console.log(2, err);
    });
};

exports.updateGameHasLeavers = (id) => {
  new sql.Request(logConnection).query(constants.updateGameHasLeavers(id))
    .catch((err) => {
      console.log(3, err);
    });
};
