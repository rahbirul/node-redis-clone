'use strict';

var chai = require('chai');
chai.should();

var sinon = require('sinon'),
  faker = require('faker');

var storage = require('../storage'),
  redis = require('../redis');

describe('redis', function () {

  var req, res, key, value;

  beforeEach(function () {
    key = faker.random.uuid();
    value = faker.random.uuid();
    res = {
      nil: sinon.spy(),
      bulk: sinon.spy(),
      ok: sinon.spy(),
      number: sinon.spy(),
      error: sinon.spy()
    };
  });

  describe('get', function () {
    afterEach(function () {
      storage.get.restore();
    });
    describe('when the key is not found', function () {
      before(function () {
        sinon.stub(storage, 'get', function () { return null; });
      });

      it('should send nil to the client', function () {
        req = {key: key};
        redis.get(req, res);
        storage.get.calledWith(key).should.be.true;
        res.nil.should.have.been.called;
      });
    });
    describe('when the key is found', function () {
      before(function () {
        sinon.stub(storage, 'get', function () { return value; });
      });

      it('should send the value to the client as bulk string', function () {
        req = {key: key};
        redis.get(req, res);
        storage.get.calledWith(key).should.be.true;
        res.bulk.calledWith(value).should.be.true;
      });
    });
  });

  describe('set', function () {
    before(function () {
      sinon.spy(storage, 'set');
    });
    after(function () {
      storage.set.restore();
    });
    it('should set the correct value of specified key', function () {
      req = {key: key, value: value};
      redis.set(req, res);
      storage.set.calledWith(key, value).should.be.true;
      res.ok.should.have.been.called;
    });
  });

  describe('exists', function () {

    afterEach(function () {
      storage.exists.restore();
    });

    describe('when the key does not exist', function () {
      before(function () {
        sinon.stub(storage, 'exists', function () {
          return 0;
        });
      });
      it('should send integer 0 back to the client', function () {
        req = {key: key};
        redis.exists(req, res);
        res.number.calledWith(0).should.be.true;
      });
    });

    describe('when the key does exist', function () {
      before(function () {
        sinon.stub(storage, 'exists', function () {
          return 1;
        });
      });
      it('should send integer 1 back to the client', function () {
        req = {key: key};
        redis.exists(req, res);
        res.number.calledWith(1).should.be.true;
      });
    });
  });

  describe('del', function () {
    var deleted;
    before(function () {
      deleted = faker.random.number();
      sinon.stub(storage, 'del', function () {
        return deleted;
      });
    });
    after(function () {
      storage.del.restore();
    });
    it('should return the number of deleted keys to the client', function () {
      req = {key: key};
      redis.del(req, res);
      res.number.calledWith(deleted).should.be.true;
    });
  });

  describe('incr', function () {
    describe('if the key is non existent', function (){
      before(function () {
        sinon.stub(storage, 'exists', function () {
          return 0;
        });
        sinon.spy(storage, 'set');
      });
      after(function () {
        storage.exists.restore();
        storage.set.restore();
      });
      it('should set the value to 0 and perform increment', function () {
        req = {key: key};
        redis.incr(req, res);
        storage.set.calledWith(key, '1').should.be.true;
        res.number.calledWith(1).should.be.true;
      });
    });
    describe('if the key does exist', function () {
      var currentValue;
      beforeEach(function () {
        sinon.stub(storage, 'exists', function () {
          return 1;
        });
        sinon.spy(storage, 'set');
      });
      afterEach(function () {
        storage.exists.restore();
        storage.set.restore();
      });
      describe ('and the value can be increased numerically', function () {
        before(function () {
          currentValue = faker.random.number();
          sinon.stub(storage, 'get', function () {
            return currentValue;
          });
        });
        after(function () {
          storage.get.restore();
        });
        it('should perform increment and send the number to the client', function () {
          req = {key: key};
          redis.incr(req, res);
          var incrValue = currentValue + 1;
          storage.set.calledWith(key, incrValue).should.be.true;
          res.number.calledWith(incrValue).should.be.true;
        });
      });
      describe ('but the value cannot be increased numerically', function () {
        before(function () {
          currentValue = faker.random.uuid();
          sinon.stub(storage, 'get', function () {
            return currentValue;
          });
        });
        after(function () {
          storage.get.restore();
        });
        it('should not be able perform increment and send error to client', function () {
          req = {key: key};
          redis.incr(req, res);
          storage.set.should.not.have.been.called;
          res.error.should.have.been.called;
        });
      });
    });
  });

  describe('decr', function () {
    describe('if the key is non existent', function (){
      before(function () {
        sinon.stub(storage, 'exists', function () {
          return 0;
        });
        sinon.spy(storage, 'set');
      });
      after(function () {
        storage.exists.restore();
        storage.set.restore();
      });
      it('should set the value to 0 and perform decrement', function () {
        req = {key: key};
        redis.decr(req, res);
        storage.set.calledWith(key, '-1').should.be.true;
        res.number.calledWith(-1).should.be.true;
      });
    });
    describe('if the key does exist', function () {
      var currentValue;
      beforeEach(function () {
        sinon.stub(storage, 'exists', function () {
          return 1;
        });
        sinon.spy(storage, 'set');
      });
      afterEach(function () {
        storage.exists.restore();
        storage.set.restore();
      });
      describe ('and the value can be decreased numerically', function () {
        before(function () {
          currentValue = faker.random.number();
          sinon.stub(storage, 'get', function () {
            return currentValue;
          });
        });
        after(function () {
          storage.get.restore();
        });
        it('should perform decrement and send the number to the client', function () {
          req = {key: key};
          redis.decr(req, res);
          var decrValue = currentValue - 1;
          storage.set.calledWith(key, decrValue).should.be.true;
          res.number.calledWith(decrValue).should.be.true;
        });
      });
      describe ('but the value cannot be decreased numerically', function () {
        before(function () {
          currentValue = faker.random.uuid();
          sinon.stub(storage, 'get', function () {
            return currentValue;
          });
        });
        after(function () {
          storage.get.restore();
        });
        it('should not be able perform decrement and send error to client', function () {
          req = {key: key};
          redis.decr(req, res);
          storage.set.should.not.have.been.called;
          res.error.should.have.been.called;
        });
      });
    });
  });
});