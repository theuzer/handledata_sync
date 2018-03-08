const sql = require('mssql');
const axios = require('axios');

const telemetryHandler = require('./telemetryHandler');
const dataConnection = require('../database/azureDb').dataConnection;
const logConnection = require('../database/azureDb').logConnection;
const updateLogGame = require('./updateLogGame');
const constants = require('../common/constants');

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
      console.log(constants.errors.getTelemetry, err);
    });
};

const checkIfGameExist = (id, gameId, stats) => {
  new sql.Request(dataConnection).query(constants.queries.checkIfGameExists(gameId))
    .then((response) => {
      if (response.recordset.length === 0) {
        addGameToQueue({ id, gameId, stats });
      } else {
        updateLogGame.updateGameIsProcessed(id);
      }
    })
    .catch((err) => {
      console.log(constants.errors.checkIfGameExist, err.code);
    });
};

exports.syncGames = () => {
  console.time('Retrieve games');
  new sql.Request(logConnection).query(constants.queries.getMatchesQuery)
    .then((response) => {
      console.timeEnd('Retrieve games');
      console.log(`Retrieve games. Got ${response.recordset.length} games`);
      response.recordset.forEach((game) => {
        checkIfGameExist(game.id, game.gameId, game.stats);
      });
    })
    .catch((err) => {
      console.log(constants.errors.retrieveGames, err);
    });
};

/* TO DELETE AFTER */
const gamesQueue2 = [];
let isRunning2 = false;

const canRun2 = () => !isRunning2 && gamesQueue2.length !== 0;

const getTelemetry2 = () => {
  const game = gamesQueue2.shift();
  axios.get(game.stats)
    .then((response) => {
      telemetryHandler.insertPlayerLastMatch(response.data, game.id);
      if (canRun2()) {
        getTelemetry2();
      } else {
        isRunning2 = false;
      }
    })
    .catch((err) => {
      console.log('getTelemetry', err);
    });
};

exports.syncExistingGames = () => {
  new sql.Request(logConnection).query(constants.toDelete.getGames)
    .then((response) => {
      console.log(`got ${response.recordset.length} games from process to delete...`);
      response.recordset.forEach((game) => {
        gamesQueue2.push({ id: game.id, stats: game.stats });
      });
    })
    .catch((err) => {
      console.log('sync existing games', err);
    });
};

setInterval(() => {
  console.log(`Queue has ${gamesQueue.length} games`);
  if (canRun()) {
    getTelemetry();
  }
  if (canRun2()) {
    getTelemetry2();
  }
}, 10000);
