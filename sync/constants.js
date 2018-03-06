module.exports = {
  getMatchesQuery: 'select top(2000) g.id, g.stats, g.gameId from game g where g.hasLeavers = 0 and g.hasError = 0 and g.isProcessed = 0',
  checkIfGameExists: gameId => `select top(1) id from match where matchid = '${gameId}'`,
  updateGameIsProcessed: id => `update game set isProcessed = 1 where id = ${id}`,
  updateGameHasLeavers: id => `update game set HasLeavers = 1 where id = ${id}`,
  updateGameHasError: id => `update game set HasError = 1 where id = ${id}`,

  toDelete: "select top(2000) id, stats from game where isprocessed = 1 and haserror = 0 and hasleavers = 0 and isprocessed2 = 0 and logdate < '2018-3-6 16:10:00'",
  updateGameIsProcessed2: id => `update game set isProcessed2 = 1 where id = ${id}`,
};
