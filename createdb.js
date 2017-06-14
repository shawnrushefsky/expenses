var mongo = require("mongodb").MongoClient
var url = 'mongodb://localhost:27017/expense_app'

var defCallback = function(err, res){
  if(err){
    console.log(err);
  }
  else{
    console.log(res);
  }
}

mongo.connect(url, function(err, db){
  if(err){
    console.log(err)
  }
  else{
    db.createCollection("users", defCallback);
    db.createCollection("expenses", defCallback);
    db.close()
  }
})
