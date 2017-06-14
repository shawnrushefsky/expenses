var chai = require("chai")
var users = require("../users.js")
var expenses = require("../expenses.js")
var uuid = require('uuid/v4')

var expect = chai.expect;
var username;

describe("users.js", function(){
  describe("#hashPassword", function(){
    it('returns a hashed password', function(done){
      users.hashPassword("password", function(hashed){
        expect(hashed).to.be.a('string');
        expect(hashed).to.not.equal("password");
        done();
      });

    })
  })
  describe("#createUser", function(){
    it('succeeds when inserting a new user', function(done){
      username = "myusername";
      users.createUser(username, "passw0rd", "user", function(err, r){
        if(err){
          done(err);
        }
        expect(r).to.be.an('object');
        expect(r).to.have.all.keys(['_id', 'success']);
        expect(r._id).to.equal(username);
        expect(r.success).to.be.true;
        done();
      })
    })
    it('fails when inserting a user that already exists', function(done){
      users.createUser(username, "passw0rd", "user", function(err, r){
        if(err){
          done();
        }
        else{
          console.log(r)
          done(new Error(username + " already existed and should have been rejected"));
        }
      })
    })
  })
  describe("#validateUsername", function(){
    it('rejects a username that is all numbers', function(done){
      users.validateUsername(456778, function(valid){
        expect(valid).to.be.false;
        done();
      })
    })
    it('rejects a username that is too short', function(done){
      users.validateUsername("user", function(valid){
        expect(valid).to.be.false;
        done();
      })
    })
    it('rejects a username that is empty', function(done){
      users.validateUsername("", function(valid){
        expect(valid).to.be.false;
        done();
      })
    })
    it('rejects a username that is null', function(done){
      users.validateUsername(null, function(valid){
        expect(valid).to.be.false;
        done();
      })
    })
    it('accepts a username that is at least 5 characters', function(done){
      users.validateUsername("notinuse", function(valid){
        expect(valid).to.be.true;
        done();
      })
    })
    it('rejects a username that is in use already', function(done){
      users.validateUsername(username, function(valid){
        expect(valid).to.be.false;
        done();
      })
    })
    it('accepts a uuid as a username', function(done){
      users.validateUsername(uuid(), function(valid){
        expect(valid).to.be.true;
        done();
      })
    })
  })
  describe("#validatePassword", function(){
    it('returns true is password is at least 8 characters and contains a number', function(){
      expect(users.validatePassword("no")).to.be.false;
      expect(users.validatePassword()).to.be.false;
      expect(users.validatePassword(12345678)).to.be.false;
      expect(users.validatePassword("password")).to.be.false;
      expect(users.validatePassword("passw0rd")).to.be.true;
    })
  })
  describe("#validateRole", function(){
    it('returns true if role = "admin" or "user"', function(){
      expect(users.validateRole("wizard")).to.be.false;
      expect(users.validateRole("admin")).to.be.true;
      expect(users.validateRole()).to.be.false;
      expect(users.validateRole("user")).to.be.true;
      expect(users.validateRole(0)).to.be.false;
    })
  })

  describe('#verifyPassword', function(){
    it('returns username if password matches', function(done){
      users.verifyPassword(username, "passw0rd", function(valid){
        expect(valid).to.equal(username);
        done();
      })
    })
    it("returns nothing if password doesn't match", function(done){
      users.verifyPassword(username, "wrong password", function(valid){
        expect(valid).to.be.undefined;
        done();
      })
    })
  })
})
