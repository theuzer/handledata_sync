const sql = require('mssql');

const logConnection = require('../database/azureDb').logConnection;
const constants = require('../common/constants');

exports.updateGameHasError = (id) => {
  new sql.Request(logConnection).query(constants.updateGameHasError(id))
    .catch((err) => {
      console.log(constants.errors.updateGameHasError, err);
    });
};

exports.updateGameIsProcessed = (id) => {
  new sql.Request(logConnection).query(constants.updateGameIsProcessed(id))
    .catch((err) => {
      console.log(constants.errors.updateGameIsProcessed, err);
    });
};

exports.updateGameHasLeavers = (id) => {
  new sql.Request(logConnection).query(constants.updateGameHasLeavers(id))
    .catch((err) => {
      console.log(constants.errors.updateGameHasLeavers, err);
    });
};
