var assert = require('assert');
var configuration = require('./../settings.js').Settings;
var expect = require('./dep/expect.js');
var logger = {};
logger.warn = function(message){throw new Error(message)};

describe('functionnal testing', function () {
  var config;
  beforeEach(function () {
    config = new configuration(logger);
  });

  it('overwrite', function () {
    var ctest = 0;
    config.add({
      name: "parameter_1",
      defaultValue: 0,
      validator: "number", 
      onChange: function(){ctest++;},
      locked: false
    });
    config.set("parameter_1",5);
    config.set("parameter_1",10);

    var p1 = config.getParameter("parameter_1");
    expect(p1.validValue).to.be(10);
    expect(p1.pendingValue).to.be.undefined;
    expect(p1.defaultValue).to.be(0);      
    expect(ctest).to.be(2);

     var ctest2 = 0;
    config.add({
      name: "parameter_2",
      defaultValue: 0,
      validator: "number",
      validationMoment: configuration.validationMoment.ONDEMAND,
      onChange: function(){ctest2++;},
      locked: false
    });
    config.set("parameter_2",5);
    config.set("parameter_2",10);

    var p2 = config.getParameter("parameter_2");
    expect(p2.validValue).to.be.undefined;
    expect(p2.defaultValue).to.be(0);      
    expect(ctest2).to.be(0);
    expect(p2.pendingValue).to.be(10);

    config.get("parameter_2");
    config.get("parameter_2");
    p2 = config.getParameter("parameter_2");
    expect(p2.validValue).to.be(10);
    expect(p2.pendingValue).to.be.undefined;
    expect(p2.defaultValue).to.be(0);      
    expect(ctest2).to.be(1);

    config.reset("parameter_2");
    config.get("parameter_2");
    p2 = config.getParameter("parameter_2");
    expect(p2.validValue).to.be(0);
    expect(p2.pendingValue).to.be.undefined;
    expect(p2.defaultValue).to.be(0);      
    expect(ctest2).to.be(2);   

  });
  it('adding duplicates', function () {
    config.add({
      name: "parameter_1"
    });
    expect(function () {
      config.add({
        name: "parameter_1"
      })
    }).to.throwError();

  });

});