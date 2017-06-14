var mongo = require("mongodb").MongoClient
var url = 'mongodb://localhost:27017/expense_app'

mongo.connect(url, function(err, db){
  if(err){
    console.log(err)
  }
  else{
    db.createCollection("users", function(err, res){
      if(err){
        console.log(err);
      }
      else{
        console.log(res);
      }
      db.createCollection("expenses", function(er, r){
        if(er){
          console.log(er);
        }
        else{
          console.log(r);
        }
        db.close()
      });
    });


  }
})
