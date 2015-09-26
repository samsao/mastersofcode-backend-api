var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/oyeoye');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('database success');
});