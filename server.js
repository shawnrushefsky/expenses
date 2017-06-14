const express = require('express')
const users = require('./users.js')
const expenses = require('./expenses.js')
const session = require('express-session');
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')

var https = require('https');
// Setup HTTPS
var options = {
  key: fs.readFileSync(path.join(__dirname, "certs", "key.key")),
  cert: fs.readFileSync(path.join(__dirname, "certs", "cert.crt"))
};

const app = express()

app.locals.basedir = path.join(__dirname, "static")
app.use(express.static('./static/'))
app.use(bodyParser())
app.use(session({secret: 'ssshhhhh'}))
app.set('view engine', 'pug')

var loggedIn = function(req, res, username){
  req.session.regenerate(function(){
    req.session.user = username
    req.session.success = 'Authenticated as ' + username
      + ' click to <a href="/logout">logout</a>. '
    res.redirect('/app')
  })
}

var failLogin = function(req, res){
  req.session.error = 'Authentication failed, please check your '
    + ' username and password.'
  res.send('Login unsuccessful, <a href="/">click to go back.</a>')
}

app.post("/newuser", (req, res)=>{
  var role = "user"
  if(req.body.admin === "on"){
    role = "admin"
  }
  users.createUser(req.body.username, req.body.pw, role, (e, r)=>{
    if(e){
      failLogin(req, res)
    }
    else{
      loggedIn(req, res, req.body.username)
    }
  })
})

app.post("/login", (req, res)=>{
  users.verifyPassword(req.body.username, req.body.pw, (username)=>{
    if (username) {
      loggedIn(req, res, username)
    }
    else {
      failLogin(req, res)
    }
  });
})

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    failLogin(req, res)
  }
}

app.get('/app', restrict, (req, res)=>{
  res.render('app', {
    header: "Expenses",
    myname: `window.myName = '${req.session.user}'`
 })
})

app.get("/", (req, res)=>{
  res.render('login', {
    action: '/login',
    prompt: "Log in to your account",
    adminlabel: "",
    check: true,
    msg: "Create a free account"})
})

app.get("/createaccount", (req, res)=>{
  res.render('login', {
    action: '/newuser',
    prompt: "Create a new account",
    adminlabel: "Admin Account",
    check: false,
    msg: ""
   })
})

app.post("/expenses", restrict, (req, res)=>{
  var b = req.body
  expenses.create(req.session.user, b.timestamp, b.amount, b.description, (r)=>{
    res.send(r)
  })

})

app.get("/expenses", restrict, (req, res)=>{
  var q = req.query

  if(q.all == "true"){
    expenses.retrieveAll(req.session.user, (r)=>{
      res.send(JSON.stringify(r))
    })
  }
  else{
    expenses.retrieveRange(req.session.user, q.start, q.end, (r)=>{
      res.send(JSON.stringify(r))
    })
  }
})

app.put("/expenses", restrict, (req, res)=>{
  var b = req.body
  expenses.update(req.session.user, b.id, b.timestamp, b.amount, b.description, (r)=>{
    res.send(JSON.stringify(r))
  })
})

app.delete("/expenses", restrict, (req, res)=>{
  var b = req.body
  expenses.delete(req.session.user, b.id, (r)=>{
    res.send(JSON.stringify(r))
  })
})

var secureServer = https.createServer(options, app).listen(443);
