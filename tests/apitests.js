var chai = require("chai")
var r = require('request')
var fs = require('fs')
var uuid = require('uuid/v4')

var expect = chai.expect
var url = "https://localhost"

var agentOptions = {
    cert: fs.readFileSync("../certs/cert.crt"),
    key: fs.readFileSync("../certs/key.key"),
    ca: fs.readFileSync("../certs/cert.crt")
}

var user = uuid()
var pw = uuid()

describe("API Methods", function(){
  describe("POST /newuser", function(){
    it("creates a new user, and then logs into the app", function(done){
      var options = {
        url: url+"/newuser",
        agentOptions: agentOptions,
        form: {username: user, pw: pw}
      }
      r.post(options, function(e, r, b){
        expect(b).to.be.a("string")
        expect(b).to.equal("Found. Redirecting to /app")
        done()
      })
    })

  })
  describe("POST /login", function(){
    it("logs into the app", function(done){
      var options = {
        url: url+"/login",
        agentOptions: agentOptions,
        form: {username: user, pw: pw}
      }
      r.post(options, function(e, r, b){
        expect(b).to.be.a("string")
        expect(b).to.equal("Found. Redirecting to /app")
        done()
      })
    })
  })
  // describe("GET /app", function(){
  //   var options = {
  //     url: url+"/app",
  //     agentOptions: agentOptions
  //   }
  //   it("loads the app", function(done){
  //     r.get(options, function(e,r,b){
  //       console.log(b)
  //       done()
  //     })
  //   })
  // })
  describe("GET /", function(){
    it("loads the home page, formatted for login", function(done){
      r.get({url: url+"/", agentOptions: agentOptions}, function(e, r, b){
        expect(b).to.be.a('string')
        expect(b).to.include('action="/login"')
        done()
      })
    })

  })
  describe("GET /createaccount", function(){
    it("loads the home page, formatted for new user", function(done){
      r.get({url: url+"/createaccount", agentOptions: agentOptions}, function(e, r, b){
        expect(b).to.be.a('string')
        expect(b).to.include('action="/newuser"')
        done()
      })
    })
  })
  // describe("POST /expenses", function(){
  //
  // })
  // describe("GET /expenses", function(){
  //
  // })
  // describe("PUT /expenses", function(){
  //
  // })
  // describe("DELETE /expenses", function(){
  //
  // })
})
