module.exports = {
  getMatchesQuery: 'select top(2000) g.id, g.stats, g.gameId from game g where g.hasLeavers = 0 and g.hasError = 0 and g.isProcessed = 0',
  checkIfGameExists: gameId => `select top(1) id from match where matchid = '${gameId}'`,
  updateGameAsProcessed: id => `update game set isProcessed = 1 where id = ${id}`,
  updateGameHasLeavers: id => `update game set HasLeavers = 1 where id = ${id}`,
};
