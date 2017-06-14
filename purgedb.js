var mongo = require("mongodb").MongoClient
var url = 'mongodb://localhost:27017/expense_app'

mongo.connect(url, function(err, db){
  db.collection('users').remove();
  db.collection('expenses').remove();
  db.close();
})
