var chai = require("chai")
var expenses = require("../expenses.js")

var expect = chai.expect;

var x;

describe("expenses.js", function(){
  describe("#create", function(){
    it("rejects improperly formatted date", function(done){
      expenses.create("myusername", 'garble', '200', 'sample', function(r){
        expect(r).to.be.an('error')
        done()
      })
    })
    it("rejects improperly formatted amount", function(done){
      var date = "2017-06-13"
      expenses.create("myusername", date, 'garble', 'sample', function(r){
        expect(r).to.be.an('error')
        done()
      })
    })
    it("returns the inserted expense if successful", function(done){
      var date = "2017-06-13"
      expenses.create("myusername", date, '200', 'sample', function(r){
        expect(r).to.be.an('object')
        expect(r).to.have.all.keys(["Owner", "Datetime", "Amount", "Description", "_id"])
        expect(r.Owner).to.be.a('string')
        expect(r.Owner).to.equal("myusername")
        expect(r.Datetime).to.be.a('string')
        expect(r.Datetime).to.equal(date)
        expect(r.Amount).to.be.a('number')
        expect(r.Amount).to.equal(200)
        expect(r.Description).to.be.a('string')
        expect(r.Description).to.equal('sample')
        expect(r._id).to.be.a('string')
        x = r;
        done()
      })
    })
  })
  describe("#update", function(){
    it("updates the expense", function(done){
      expenses.update(x.Owner, x._id, x.Datetime, 20000, x.Description, function(r){
        expect(r).to.be.an('object')
        expect(r).to.have.all.keys(["Owner", "Datetime", "Amount", "Description", "_id"])
        expect(r.Amount).to.equal(20000)
        done()
      })
    })
  })
  describe("#retrieveAll", function(){
    it("retrieves all expenses belonging to a user", function(done){
      expenses.retrieveAll("myusername", function(r){
        expect(r).to.be.an('array')
        done()
      })
    })
    it("returns an empty array if a user has no expenses", function(done){
      expenses.retrieveAll("emptyuser", function(r){
        expect(r).to.be.an('array')
        expect(r).to.have.lengthOf(0)
        done()
      })
    })
  })
  describe("retrieveRange", function(){
    it("retrieves all expenses within the specified datetime range", function(done){
      expenses.retrieveRange("myusername", '2017-06-14', '2017-06-14', function(r){
        expect(r).to.be.an('array')
        var start = new Date('2017-06-13').getTime()
        var end = new Date('2017-06-13').getTime()
        for(var item of r){
          var t = new Date(item.Datetime).getTime()
          expect(t).to.be.at.least(start)
          expect(t).to.be.at.most(end)
        }
        done()
      })
    })
  })
  describe("#delete", function(){
    it("deletes the expense", function(){
      it("returns true if the expense is deleted", function(done){
        expenses.delete(x.Owner, x._id, function(r){
          expect(r).to.be.true;
          done()
        })
      })
      it("returns false if the expense could not be deleted", function(done){
        expenses.delete(x.Owner, x._id, function(r){
          expect(r).to.be.false;
          done()
        })
      })
    })

  })
})
