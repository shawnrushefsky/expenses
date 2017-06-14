var mongo = require("mongodb").MongoClient
var bcrypt = require("bcrypt")

var url = 'mongodb://localhost:27017/expense_app'
const saltRounds = 10;

function hashPassword(password, callback) {
    bcrypt.hash(password, saltRounds, function(err, hash){
      if(err){
        console.log(err);
      }
      else{
        callback(hash);
      }
    })
}

function validateUsername(username, callback){
  if(typeof username !== "string" || username.length < 5){
    callback(false);
  }
  else{
    mongo.connect(url, function(err, db){
      db.collection('users').findOne({_id: username}, {fields:{_id: 1}}, function(err, doc){
        if(err){
          callback(true);
        }
        else if (doc) {
          callback(false);
        }
        else{
          callback(true);
        }
        db.close();
      })
    })
  }
}

function validatePassword(password){
  var isString = typeof password === "string";
  if(isString){
    var longEnough = password.length >= 8;
    var res = password.match(/\d/g);
    var hasNumber = res !== null && res.length > 0;
    return isString && longEnough && hasNumber;
  }
  return false;
}

function validateRole(role){
  return typeof role === "string" && ["admin", "user"].indexOf(role) > -1;
}

var createUser = function(username, pw, role, callback){
  validateUsername(username, function(valid){
    if(!valid){
      callback(new Error("Invalid Username: "+username));
    }
    else{
      if(!validatePassword(pw)){
        callback(new Error("Invalid Password"));
        return;
      }
      if(!validateRole(role)){
        callback(new Error("Invalid Role"));
        return;
      }
      hashPassword(pw, function(hash){
        var user = {
          _id: username,
          pw: hash,
          expenses: [],
          role: role
        }
        mongo.connect(url, function(err, db){
          db.collection("users").insertOne(user, function(err, r){
            if(err){
              callback(new Error("New user could not be created."));
            }
            else{
              callback(null, {_id: r.insertedId, success: r.insertedCount === 1})
            }
            db.close();
          })
        })
      })
    }
  })
}

var verifyPassword = function(username, pw, callback){
  mongo.connect(url, function(err, db){
    db.collection('users').findOne({_id: username}, {fields:{pw: 1, _id: 1}}, function(err, doc){
      if(doc){
        bcrypt.compare(pw, doc.pw, function(e, r){
          if(r){
            callback(doc._id)
          }
          else{
            callback()
          }
        })
      }
      else{
        callback()
      }
    })
  })
}

module.exports = {
  hashPassword: hashPassword,
  validateUsername: validateUsername,
  validatePassword: validatePassword,
  validateRole: validateRole,
  verifyPassword: verifyPassword,
  createUser: createUser
}
