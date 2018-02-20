const sql = require('mssql');
const axios = require('axios');

const telemetryHandler = require('./telemetryHandler');
const dataConnection = require('../database/azureDb').dataConnection;
const logConnection = require('../database/azureDb').logConnection;
const updateLogGame = require('./updateLogGame');
const constants = require('./constants');

const gamesQueue = [];
let isRunning = false;

const canRun = () => !isRunning && gamesQueue.length !== 0;

const addGameToQueue = (game) => {
  if (!gamesQueue.some(queueGame => queueGame.id === game.id)) {
    gamesQueue.push(game);
  }
};

const getTelemetry = () => {
  const game = gamesQueue.shift();
  axios.get(game.stats)
    .then((response) => {
      telemetryHandler.mapTelemetry(response.data, game.id);
      if (canRun()) {
        getTelemetry();
      } else {
        isRunning = false;
      }
    })
    .catch((err) => {
      console.log('getTelemetry', err);
    });
};

const checkIfGameExist = (id, gameId, stats) => {
  new sql.Request(dataConnection).query(constants.checkIfGameExists(gameId))
    .then((response) => {
      if (response.recordset.length === 0) {
        addGameToQueue({ id, gameId, stats });
      } else {
        updateLogGame.updateGameIsProcessed(id);
      }
    })
    .catch((err) => {
      console.log('checkIfGamesExist', err.code);
    });
};


exports.syncGames = () => {
  console.time('get 2000 games');
  new sql.Request(logConnection).query(constants.getMatchesQuery)
    .then((response) => {
      console.timeEnd('get 2000 games');
      console.log(`got ${response.recordset.length} games`);
      response.recordset.forEach((game) => {
        checkIfGameExist(game.id, game.gameId, game.stats);
      });
    })
    .catch((err) => {
      console.log('syncGames', err);
    });
};

setInterval(() => {
  console.log(gamesQueue.length);
  if (canRun()) {
    getTelemetry();
  }
}, 10000);
