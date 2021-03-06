const sql = require('mssql');

const logConnection = require('../database/azureDb').logConnection;
const constants = require('../common/constants');

exports.updateGameHasError = (id) => {
  new sql.Request(logConnection).query(constants.queries.updateGameHasError(id))
    .catch((err) => {
      console.log(constants.errors.updateGameHasError, err);
    });
};

exports.updateGameIsProcessed = (id) => {
  new sql.Request(logConnection).query(constants.queries.updateGameIsProcessed(id))
    .catch((err) => {
      console.log(constants.errors.updateGameIsProcessed, err);
    });
};

exports.updateGameHasLeavers = (id) => {
  new sql.Request(logConnection).query(constants.queries.updateGameHasLeavers(id))
    .catch((err) => {
      console.log(constants.errors.updateGameHasLeavers, err);
    });
};

/* TO DELETE */
exports.updateGameIsProcessed2 = (id) => {
  new sql.Request(logConnection).query(constants.toDelete.updateGameIsProcessed2(id))
    .catch((err) => {
      console.log(2, err);
      console.log(constants.errors.updateGameHasLeavers, err);
    });
};