const express = require('express');
const ontime = require('ontime');
const https = require('https');

const sync = require('./sync/index');
const dataConnection = require('./database/azureDb').dataConnection;
const logConnection = require('./database/azureDb').logConnection;
const constants = require('./common/constants');

const port = process.env.PORT || 3000;

const app = express();

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server listening on port ${port}`);
  }
});

// Keep app awake in Heroku
if (process.env.HEROKU_TIMER_CREATE === 'TRUE') {
  setInterval(() => {
    https.get(process.env.HEROKU_APP_URL);
    console.log('Pinged application');
  }, parseInt(process.env.HEROKU_APP_TIMER, 10));
}

dataConnection.connect().then(() => { console.log('data connection'); }).catch((err) => { console.log(constants.errors.dataOnConnection, err); });
logConnection.connect().then(() => { console.log('log connection'); }).catch((err) => { console.log(constants.errors.logOnConnection, err); });

dataConnection.on('error', (err) => { console.log(constants.errors.dataConnection, err); });
logConnection.on('error', (err) => { console.log(constants.errors.logConnection, err); });

app.get('/', (req, res) => { res.send('test'); });

ontime({
  cycle: ['0'],
}, (ot) => {
  sync.syncGames();
  sync.syncExistingGames();
  ot.done();
});
