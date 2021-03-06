const dataController = require('../controllers/dataController');
const updateLogGame = require('./updateLogGame');
const constants = require('../common/constants');

// const sortByTimestamp = telemetry => telemetry.sort((a, b) => a.cursor - b.cursor);
const filterTelemetry = (telemetry, type) => telemetry.filter(x => x.type === type);
const extractMatchStart = telemetry => filterTelemetry(telemetry, constants.telemetry.matchStart);
const extractPlayers = telemetry => filterTelemetry(telemetry, constants.telemetry.user);
const extractMatchFinished = telemetry => filterTelemetry(telemetry, constants.telemetry.matchFinish);
const extractTalentPickEvents = telemetry => filterTelemetry(telemetry, constants.telemetry.pickBattlerite);
const extractRounds = telemetry => filterTelemetry(telemetry, constants.telemetry.roundFinish);
const extractTeamUpdateEvent = telemetry => filterTelemetry(telemetry, constants.telemetry.teamUpdate);
const checkIfMatchIsRanked = players => players[0].dataObject.rankingType === constants.telemetry.ranked;

const mapPlayerLastMatch = (teamUpdateEvent, playerCode, isRanked, matchDate) => ({
  playerCode,
  teamCode: teamUpdateEvent.teamID,
  teamSize: teamUpdateEvent.teamSize,
  division: teamUpdateEvent.division,
  divisionRating: teamUpdateEvent.divisionRating,
  league: teamUpdateEvent.league,
  wins: teamUpdateEvent.wins,
  losses: teamUpdateEvent.losses,
  isRanked,
  lastMatchDate: matchDate,
  season: teamUpdateEvent.season,
  placementGamesLeft: teamUpdateEvent.placementGamesLeft,
});

const mapTalents = (talents) => {
  const seen = {};
  const out = [];
  let j = 0;
  for (let i = 0; i < talents.length; i++) {
    const item = talents[i].dataObject.battleriteType;
    if (seen[item] !== 1) {
      seen[item] = 1;
      out[j++] = item;
    }
  }
  return out;
};

const mapRoundStats = (rounds, playerId) => {
  const stats = {
    abilityUses: 0,
    damageDone: 0,
    damageReceived: 0,
    deaths: 0,
    disablesDone: 0,
    disablesReceived: 0,
    energyGained: 0,
    energyUsed: 0,
    healingDone: 0,
    healingReceived: 0,
    kills: 0,
    score: 0,
    timeAlive: 0,
  };
  rounds.forEach((round) => {
    const roundStats = round.dataObject.playerStats.filter(x => x.userID === playerId)[0];
    Object.keys(stats).forEach((key) => {
      stats[key] += roundStats[key];
    });
  });
  return stats;
};

const mapCharacter = (playerIn, talentPickEvents, rounds) => {
  const talents = talentPickEvents.filter(x => x.dataObject.userID === playerIn.accountId);
  const stats = mapRoundStats(rounds, playerIn.accountId);
  return {
    playerId: playerIn.accountId,
    teamId: playerIn.teamId,
    character: playerIn.character,
    characterLevel: playerIn.characterLevel,
    characterTimePlayed: playerIn.characterTimePlayed,
    division: playerIn.division,
    divisionRating: playerIn.divisionRating,
    league: playerIn.league,
    totalTimePlayed: playerIn.totalTimePlayed,
    attachment: playerIn.attachment,
    emote: playerIn.emote,
    mount: playerIn.mount,
    outfit: playerIn.outfit,
    talents: mapTalents(talents),
    abilityUses: stats.abilityUses,
    damageDone: stats.damageDone,
    damageReceived: stats.damageReceived,
    deaths: stats.deaths,
    disablesDone: stats.disablesDone,
    disablesReceived: stats.disablesReceived,
    energyGained: stats.energyGained,
    energyUsed: stats.energyUsed,
    healingDone: stats.healingDone,
    healingReceived: stats.healingReceived,
    kills: stats.kills,
    score: stats.score,
    timeAlive: stats.timeAlive,
  };
};

const mapCharacters = (teamCharacters, talents, rounds) => {
  const result = [];
  teamCharacters.forEach((character) => {
    result.push(mapCharacter(character.dataObject, talents, rounds));
  });
  return result;
};

const mapTeam = (teamNo, players, talents, win, rounds) => {
  const teamCharacters = players.filter(x => x.dataObject.team === teamNo);
  return {
    win,
    teamNo,
    characters: mapCharacters(teamCharacters, talents, rounds),
  };
};

exports.mapTelemetry = (telemetry, id) => {
  const matchFinishEvent = extractMatchFinished(telemetry)[0].dataObject;

  if (matchFinishEvent.leavers.length !== 0) {
    updateLogGame.updateGameHasLeavers(id);
  } else {
    const matchStartEvent = extractMatchStart(telemetry)[0].dataObject;
    const players = extractPlayers(telemetry);
    const talents = extractTalentPickEvents(telemetry);
    const rounds = extractRounds(telemetry);
    const teamUpdateEvents = extractTeamUpdateEvent(telemetry);

    const team1 = mapTeam(1, players, talents, matchFinishEvent.teamOneScore > matchFinishEvent.teamTwoScore, rounds);
    const team2 = mapTeam(2, players, talents, matchFinishEvent.teamTwoScore > matchFinishEvent.teamOneScore, rounds);

    const isRanked = checkIfMatchIsRanked(players);

    const playerLastMatchList = [];
    players.forEach((player) => {
      const teamUpdateEvent = teamUpdateEvents.filter(x => x.dataObject.userIDs.includes(player.dataObject.accountId));
      if (teamUpdateEvent.length !== 0) {
        const playerLastMatch = mapPlayerLastMatch(teamUpdateEvent[0].dataObject, player.dataObject.accountId, isRanked, new Date(matchStartEvent.time));
        playerLastMatchList.push(playerLastMatch);
      }
    });

    const match = {
      mapId: matchStartEvent.mapID,
      matchId: matchStartEvent.matchID,
      region: matchStartEvent.region,
      date: new Date(matchStartEvent.time),
      type: matchStartEvent.type,
      patch: matchStartEvent.version,
      teamSize: matchStartEvent.teamSize,
      isRanked,
      numberOfRounds: rounds.length,
      team1,
      team2,
      playerLastMatchList,
    };

    dataController.insertMatch(match, id);
  }
};

/* TO DELETE */
exports.insertPlayerLastMatch = (telemetry, id) => {
  const matchStartEvent = extractMatchStart(telemetry)[0].dataObject;
  const players = extractPlayers(telemetry);
  const teamUpdateEvents = extractTeamUpdateEvent(telemetry);
  const isRanked = checkIfMatchIsRanked(players);
  const playerLastMatchList = [];
  players.forEach((player) => {
    const teamUpdateEvent = teamUpdateEvents.filter(x => x.dataObject.userIDs.includes(player.dataObject.accountId));
    if (teamUpdateEvent.length !== 0) {
      const playerLastMatch = mapPlayerLastMatch(teamUpdateEvent[0].dataObject, player.dataObject.accountId, isRanked, new Date(matchStartEvent.time));
      playerLastMatchList.push(playerLastMatch);
    }
  });

  dataController.insertPlayerLastMatchList(playerLastMatchList, id);
};
