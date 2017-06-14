var mongo = require("mongodb").MongoClient
var ObjectID = require("mongodb").ObjectID
var url = 'mongodb://localhost:27017/expense_app'

var formatDoc = function(d){
  d._id = d._id.toString()
  var date = d.Datetime
  var yr = date.getFullYear()
  var mnth = date.getMonth()+1
  if(mnth < 10){
    mnth = `0${mnth}`
  }
  var day = date.getDate()
  if(day < 10){
    day = `0${day}`
  }
  var ds = yr+"-"+mnth+"-"+day
  d.Datetime = ds
}

function createExpense(owner, timestamp, amount, description, callback){
  var date;
  if(timestamp === ''){
    date = new Date()
  }
  else{
    date = new Date(timestamp)
    if(date == "Invalid Date"){
      callback(new Error(date+": "+timestamp))
      return;
    }
  }
  amt = Number(amount)
  if(isNaN(amt)){
    callback(new Error(amount+" is not a valid amount"))
    return;
  }

  description = String(description)

  var expense = {
    Owner: owner,
    Datetime: date,
    Amount: amt,
    Description: description
  }

  mongo.connect(url, function(err, db){
    var expenses = db.collection('expenses')
    expenses.insertOne(expense, function(err, r){
      if(err){
        callback(new Error("Expense could not be inserted."))
      }
      else{
        expenses.findOne({_id: r.insertedId}, function(e, d){
          if(e){
            callback({})
          }
          else{
            formatDoc(d)

            callback(d)
          }

        })
      }
      db.close()
    })

  })
}

function deleteExpense(owner, expenseId, callback){
  mongo.connect(url, function(err, db){
    var q = {Owner: owner, _id: new ObjectID(expenseId)}
    db.collection('expenses').deleteOne(q, function(e, r){
      callback(r.result.n === 1)
      db.close()
    })
  })
}

function updateExpense(owner, id, timestamp, amount, description, callback){
  mongo.connect(url, function(err, db){
    var q = {Owner: owner, _id: new ObjectID(id)}
    var update = {"$set": {Datetime: new Date(timestamp), Amount: Number(amount), Description: description}}
    db.collection('expenses').update(q, update, function(e, r){
      if(r.result.nModified === 1){
        db.collection('expenses').findOne(q, function(er, d){
          formatDoc(d)
          callback(d)
        })
      }
      else{
        callback({})
      }
      db.close()
    })
  })
}

function retrieveAll(owner, callback){
  mongo.connect(url, function(err, db){
    q = {}
    userPermissions(owner, db, function(role){
      if(role === "user"){
        q.Owner = owner
      }
      db.collection("expenses").find(q, function(e, r){
        r.toArray(function(er, ar){
          for(var item of ar){
            formatDoc(item)
          }
          callback(ar)
          db.close()
        })

      })
    })

  })
}

function userPermissions(user, db, callback){
  db.collection("users").findOne({_id: user}, {role: 1}, function(e, doc){
    callback(doc.role)
  })
}

function retrieveRange(owner, start_time, end_time, callback){
  mongo.connect(url, function(error, db){
    var q = {

      Datetime: {
        '$gte': new Date(start_time),
        '$lte': new Date(end_time)
      }
    }
    userPermissions(owner, db, function(role){
      if(role === "user"){
        q.Owner = owner
      }
      db.collection("expenses").find(q, function(err, res){
        res.toArray(function(e, r){
          for(var item of r){
            formatDoc(item)
          }
          callback(r)
          db.close()
        })
      })
    })

  })
}


module.exports = {
  create: createExpense,
  delete: deleteExpense,
  update: updateExpense,
  retrieveAll: retrieveAll,
  retrieveRange: retrieveRange
}
