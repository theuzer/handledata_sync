const sql = require('mssql');

const dataConnection = require('../database/azureDb').dataConnection;
const updateLogGame = require('../sync/updateLogGame');
const constants = require('../common/constants');

const azureDateBuilder = (year, month, day, hour, minute, second) => `${year}-${month}-${day} ${hour}:${minute}:${second}`;
const dateBuilder = date => azureDateBuilder(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
const boolBuilder = bool => (bool ? 1 : 0);

const insertTelemetry = (match) => {
  let query = constants.queries.insertMatch(match.matchId, match.mapId, match.region, match.type, match.patch, boolBuilder(match.isRanked), match.teamSize, dateBuilder(match.date), match.numberOfRounds);

  query += constants.queries.insertTeam(1, match.team1.teamNo, boolBuilder(match.team1.win));
  query += constants.queries.insertTeam(2, match.team2.teamNo, boolBuilder(match.team2.win));

  match.team1.characters.forEach((c) => {
    c.talents.sort((a, b) => a - b);
    query += constants.queries.insertCharacter(1, c.playerId, c.teamId, c.character, c.attachment, c.mount, c.outfit, c.emote, c.talents[0], c.talents[1], c.talents[2], c.talents[3], c.talents[4], c.characterLevel, c.characterTimePlayed, c.totalTimePlayed, c.division, c.divisionRating, c.league, c.abilityUses, c.damageDone, c.damageReceived, c.deaths, c.disablesDone, c.disablesReceived, c.energyGained, c.energyUsed, c.healingDone, c.healingReceived, c.kills, c.score, c.timeAlive);
  });

  match.team2.characters.forEach((c) => {
    c.talents.sort((a, b) => a - b);
    query += constants.queries.insertCharacter(2, c.playerId, c.teamId, c.character, c.attachment, c.mount, c.outfit, c.emote, c.talents[0], c.talents[1], c.talents[2], c.talents[3], c.talents[4], c.characterLevel, c.characterTimePlayed, c.totalTimePlayed, c.division, c.divisionRating, c.league, c.abilityUses, c.damageDone, c.damageReceived, c.deaths, c.disablesDone, c.disablesReceived, c.energyGained, c.energyUsed, c.healingDone, c.healingReceived, c.kills, c.score, c.timeAlive);
  });

  match.playerLastMatchList.forEach((p) => {
    query += constants.queries.insertPlayerLastMatch(p.playerCode, p.teamCode, dateBuilder(p.lastMatchDate), p.teamSize, p.league, p.division, p.divisionRating, p.wins, p.losses, boolBuilder(p.isRanked));
  });

  return query;
};

const getInsertTelemetryQuery = (match) => {
  let query = constants.queries.beginTransaction;
  query += insertTelemetry(match);
  query += constants.queries.commitTransaction;
  return query;
};

exports.insertMatch = (match, id) => {
  new sql.Request(dataConnection).query(getInsertTelemetryQuery(match))
    .then(() => {
      updateLogGame.updateGameIsProcessed(id);
    })
    .catch((err) => {
      if (err.code === constants.transactionErrors.request) {
        updateLogGame.updateGameHasError(id);
      } else if (err.code === constants.transactionErrors.timeout) {
        console.log(constants.errors.insertMatchTimeout, err.code, id);
      }
    });
};
